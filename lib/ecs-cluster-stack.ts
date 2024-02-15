import * as cw from 'aws-cdk-lib/aws-cloudwatch';
import { Stack, StackProps, aws_elasticloadbalancingv2 } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CfnOutput, Duration } from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs'
import * as cdk from 'aws-cdk-lib';
import { aws_ssm } from 'aws-cdk-lib';
declare const elbAlarm: cw.Alarm;


export class ECSClusterStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const vpcId = aws_ssm.StringParameter.valueFromLookup(this, '/VpcProvider/VPCID');

        const vpc = ec2.Vpc.fromLookup(this, "VPC", {
            vpcId: vpcId
        })

        const cluster = new ecs.Cluster(this, 'Cluster', { vpc, clusterName: "wordpress-cluster" });

        const securityGroup = new ec2.SecurityGroup(this, 'SecurityGroup', {
            vpc,
            description: 'Access for security group',
            allowAllOutbound: true,
            securityGroupName: "security-group",

        });

        securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'Apache port Green');
        securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(8080), 'Apache port Blue');
        securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'SSH Port');


        

        new CfnOutput(this, 'securityGroupId', { value: securityGroup.securityGroupId, exportName: "securityGroupId" });
        new CfnOutput(this, 'clusterName', { value: cluster.clusterName, exportName: "clusterName" });
    }
}