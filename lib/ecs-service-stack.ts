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

const servicePort = 8080;

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
            image: ecs.ContainerImage.fromRegistry("amazon/amazon-ecs-sample:latest"),
            memoryLimitMiB: 512,
            containerName: 'ContainerName',
            portMappings: [{ containerPort: 80 }],
            command: ["/bin/bash", "-c", "echo \"OK\" > /var/www/html/ok.html; apachectl -D FOREGROUND"],
            healthCheck: { command :[ "CMD-SHELL", "curl -f http://localhost/ok.html || exit 1" ]}
        });


        const serviceBlue = new aws_ecs_patterns.ApplicationLoadBalancedFargateService(this, "blue-service", {
            taskDefinition: TaskDefinition,
            cluster: cluster, // Required
            desiredCount: 2, // Default is 1
            cpu: 512, // Default is 256
            listenerPort: 8080,
            memoryLimitMiB: 2048,
        });

        const serviceGreen = new aws_ecs_patterns.ApplicationLoadBalancedFargateService(this, "green-service", {
          taskDefinition: TaskDefinition,
          cluster: cluster, // Required
          desiredCount: 2, // Default is 1
          cpu: 512, // Default is 256
          memoryLimitMiB: 2048,
          listenerPort: 8888,
      });

      new CfnOutput(this, 'serviceBlueName', { value: serviceBlue.service.serviceName, exportName: "serviceBlueName" });
      new CfnOutput(this, 'serviceBlueArn', { value: serviceBlue.service.serviceArn, exportName: "serviceBlueArn" })
      new CfnOutput(this, 'loadBalancerArn', { value: serviceBlue.loadBalancer.loadBalancerArn, exportName: "loadBalancerArn" })
      new CfnOutput(this, 'loadBalancerDNSName', { value: serviceBlue.loadBalancer.loadBalancerDnsName, exportName: "loadBalancerDNSNAme" })
      
    }
}

