/*import * as cw from 'aws-cdk-lib/aws-cloudwatch';
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
declare const elbAlarm: cw.Alarm;

let clusterArn  = cdk.Fn.importValue('clusterArn')



export class TaskDefinitionStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const TaskDefinition = new ecs.FargateTaskDefinition(this, 'blue-task-definition');

        TaskDefinition.addContainer('BlueTaskDefinition', {
            image: ecs.ContainerImage.fromRegistry("amazon/amazon-ecs-sample"),
            memoryLimitMiB: 512,
            containerName: 'taskdefinition-green',
            portMappings: [{ containerPort: 80 }]
        });



        const service = new aws_ecs_patterns.ApplicationLoadBalancedFargateService(this, "service", {
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
                       listenerPort: 80 
        });

        const scaling = service.service.autoScaleTaskCount({ maxCapacity: 2 });
        scaling.scaleOnCpuUtilization('CpuScaling', {
          targetUtilizationPercent: 50,
          scaleInCooldown: cdk.Duration.seconds(60),
          scaleOutCooldown: cdk.Duration.seconds(60)
        });
    
/*
        const greenTaskDefinition = new ecs.FargateTaskDefinition(this, 'green-wordpress-task-definition');

        greenTaskDefinition.addContainer('GreenTaskDefinition', {
            image: ecs.ContainerImage.fromRegistry("amazon/amazon-ecs-sample"),
            memoryLimitMiB: 512,
            containerName: 'wordpress-taskdefinition-green',
            portMappings: [{ containerPort: 80 }]
        });


        const greenService = new aws_ecs_patterns.ApplicationLoadBalancedFargateService(this, "green-service", {
            taskDefinition: greenTaskDefinition,
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
                       listenerPort: 80
        }); 

    }
}

*/