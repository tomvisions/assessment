import * as cw from 'aws-cdk-lib/aws-cloudwatch';
import { Stack, StackProps, aws_elasticloadbalancingv2 } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CfnOutput, Duration } from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { AutoScalingGroup } from 'aws-cdk-lib/aws-autoscaling';
import * as ecs from 'aws-cdk-lib/aws-ecs'
import { aws_ecs_patterns } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';
import { VPCStack } from './vpc-stack';
import { aws_ssm } from 'aws-cdk-lib';
import * as elbv2 from "aws-cdk-lib/aws-elasticloadbalancingv2";
declare const elbAlarm: cw.Alarm;

let clusterName  = cdk.Fn.importValue('clusterName')
let securityGroupId  = cdk.Fn.importValue('securityGroupId')



export class ECSServiceStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const vpcId = aws_ssm.StringParameter.valueFromLookup(this, '/VpcProvider/VPCID');
        const vpc = ec2.Vpc.fromLookup(this, "VPC", {
            vpcId: vpcId
        })
    
        const securityGroup = ec2.SecurityGroup.fromSecurityGroupId(this, 'securityGroup', securityGroupId)

        const cluster = ecs.Cluster.fromClusterAttributes(this, 'cluster', {
            clusterName: clusterName,
            vpc,
            securityGroups: [securityGroup]
        });
        const TaskDefinition = new ecs.FargateTaskDefinition(this, 'blue-task-definition');

        TaskDefinition.addContainer('BlueTaskDefinition', {
            image: ecs.ContainerImage.fromRegistry("amazon/amazon-ecs-sample"),
            memoryLimitMiB: 512,
            containerName: 'BlueContainerName',
            portMappings: [{ containerPort: 80 }]
        });


        const service = new aws_ecs_patterns.ApplicationLoadBalancedFargateService(this, "blue-service", {
            taskDefinition: TaskDefinition,
            cluster: cluster, // Required
            desiredCount: 1, // Default is 1
            cpu: 512, // Default is 256
            memoryLimitMiB: 2048,
            //   loadBalancer: lbBlue,
            /*           cluster: cluster, // Required
                       cpu: 512, // Default is 256
                       desiredCount: 1, // Default is 1
                       taskDefinition: taskDefinitionBlue,
                       serviceName: 'blue-service',
                   //    taskImageOptions: { image: ecs.ContainerImage.fromRegistry("amazon/amazon-ecs-sample") },
                       memoryLimitMiB: 2048, // Default is 512
                       publicLoadBalancer: true, // Default is true
                       deploymentController: {
                           type: ecs.DeploymentControllerType.EXTERNAL
                       },
                       listenerPort: 80 */
        });

        const scaling = service.service.autoScaleTaskCount({ maxCapacity: 2 });
        scaling.scaleOnCpuUtilization('CpuScaling', {
          targetUtilizationPercent: 50,
          scaleInCooldown: cdk.Duration.seconds(60),
          scaleOutCooldown: cdk.Duration.seconds(60)
        });


        new elbv2.ApplicationTargetGroup(this, 'asdfasfa', {

        }) 
        service.targetGroup.addTarget()
        const targetGroup = new elbv2.ApplicationTargetGroup(this, "TargetGroup", {
            targets: [service],
            protocol: elbv2.ApplicationProtocol.HTTP,
            vpc: props.vpc,
            port: 80,
            deregistrationDelay: cdk.Duration.seconds(30),
            healthCheck: {
              path: "/",
              healthyThresholdCount: 2,
              unhealthyThresholdCount: 3,
              interval: cdk.Duration.seconds(10),
              timeout: cdk.Duration.seconds(5),
              healthyHttpCodes: "200",
            },
          });
    }
}

