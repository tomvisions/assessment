import * as cw from 'aws-cdk-lib/aws-cloudwatch';
import { Stack, StackProps, aws_elasticloadbalancingv2 } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CfnOutput, Duration } from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { aws_ssm } from 'aws-cdk-lib';

export class VPCStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const vpc = new ec2.Vpc(this, 'Vpc', {
            vpcName: "wordpressCluster",
            /// ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/16'),
        });

        new aws_ssm.StringParameter(this, 'VPCID', {
            parameterName: `/VpcProvider/VPCID`,
            stringValue: vpc.vpcId
        })
    }
}