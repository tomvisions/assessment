import * as cw from 'aws-cdk-lib/aws-cloudwatch';
import { StackProps, aws_elasticloadbalancingv2 } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { AutoScalingGroup } from 'aws-cdk-lib/aws-autoscaling';
declare const vpc: ec2.Vpc;
import * as ecs from 'aws-cdk-lib/aws-ecs'
import { CdkResourceInitializer } from './resource-initializer'
import { aws_ecs_patterns } from 'aws-cdk-lib';
import { CfnOutput, Duration, Stack, Token } from 'aws-cdk-lib/core'
import { Credentials, DatabaseInstance, DatabaseInstanceEngine, DatabaseSecret, MysqlEngineVersion } from 'aws-cdk-lib/aws-rds'
import { InstanceClass, InstanceSize, InstanceType, Port, SubnetType, Vpc } from 'aws-cdk-lib/aws-ec2'
import { RetentionDays } from 'aws-cdk-lib/aws-logs'
import { DockerImageCode } from 'aws-cdk-lib/aws-lambda'

declare const elbAlarm: cw.Alarm;


export class RDSStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const instanceIdentifier = 'mysql-01'
        const credsSecretName = `/${id}/rds/creds/${instanceIdentifier}`.toLowerCase()
        const creds = new DatabaseSecret(this, 'MysqlRdsCredentials', {
            secretName: credsSecretName,
            username: 'admin'
        })

        const vpc = new Vpc(this, 'MyVPC', {
            subnetConfiguration: [{
                cidrMask: 24,
                name: 'ingress',
                subnetType: SubnetType.PUBLIC,
            }, {
                cidrMask: 24,
                name: 'compute',
                subnetType: SubnetType.PRIVATE_WITH_NAT,
            }, {
                cidrMask: 28,
                name: 'rds',
                subnetType: SubnetType.PRIVATE_ISOLATED,
            }]
        })

        const dbServer = new DatabaseInstance(this, 'MysqlRdsInstance', {
            vpcSubnets: {
                onePerAz: true,
                subnetType: SubnetType.PRIVATE_ISOLATED
            },
            credentials: Credentials.fromSecret(creds),
            vpc: vpc,
            port: 3306,
            databaseName: 'main',
            allocatedStorage: 20,
            instanceIdentifier,
            engine: DatabaseInstanceEngine.mysql({
                version: MysqlEngineVersion.VER_8_0
            }),
            instanceType: InstanceType.of(InstanceClass.T2, InstanceSize.LARGE)
        })
        // potentially allow connections to the RDS instance...
        // dbServer.connections.allowFrom ...

        const initializer = new CdkResourceInitializer(this, 'MyRdsInit', {
            config: {
                credsSecretName
            },
            fnLogRetention: RetentionDays.FIVE_MONTHS,
            fnCode: DockerImageCode.fromImageAsset(`${__dirname}/rds-init-fn-code`, {}),
            fnTimeout: Duration.minutes(2),
            fnSecurityGroups: [],
            vpc,
            subnetsSelection: vpc.selectSubnets({
                subnetType: SubnetType.PRIVATE_WITH_NAT
            })
        })
        // manage resources dependency
        initializer.customResource.node.addDependency(dbServer)

        // allow the initializer function to connect to the RDS instance
        dbServer.connections.allowFrom(initializer.function, Port.tcp(3306))

        // allow initializer function to read RDS instance creds secret
        creds.grantRead(initializer.function)

        /* eslint no-new: 0 */
        new CfnOutput(this, 'RdsInitFnResponse', {
            value: Token.asString(initializer.response)
        })
    }
}