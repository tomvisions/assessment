# Assessment Code for opportunity

Exercise: The Application Engineering team has been developing a custom WooCommerce-based product which will need to be deployed for this initiative. As a member of the DevOps Engineering team your job will be to create the cloud-based infrastructure for supporting this deployment. You will need to create a reference architecture and implement it using modern IaC techniques with documentation for 3-tier application. You can use serverless or container technology or VMs to implement this.

Create a reference architecture and implement it using modern IAC techniques with documentation for a 3 tier application. Candidates can use serverless or container technology or VMs to implement this.

After working on this code for 1 1/2 days,, I've build about 70 pecent of the infastructure needed.

Development and testing took longer then I expected. Testing itself takes a while since it's building infastucture. 

If Wordpress could of been written in JS, and using  React/NextJS or Angular. the architecture would of been much faster to build, since I could of taken advantage of building a static website running "npm run build", and using a CI/CD Pipeline to upload the static files to an AWS S3 Bucket and used Cloudfront to access it.

The application was PHP. There is a plugin to turn it into a static website, however, this would require the plugin (Simply Static) to run within a Docker container and could not investigate this quickly enough. Running Simply static within a local docker container was taking long enough (at least 30 mins - that's too long for a build - just to generate static files)

The archtecture that I went for was a Fargate architecture inside of a VPC geared for a green/blue deployment using CI/CD Pipleline


# The stacks I've build so far.

## HostZoneCdkStack
This stack builds HostZone and certification for the domain name (in this case - tc-testing.xyz)

## VPCStack
This stack builds the VPC for the Fargate docker container - VPC ID is stored in SSM paramated since it's not possible to read an output of it for other stacks. 

The VPCStack is currently configured in a way which generates the public and private subnets  automatically. It also has the NAT gateways geneated automatically. If you needed something more specific, need more time. 

## ECSClusterStack
This stack builds the ECS Cluster and Security Group. Both Cluster Name and Security Group Id are placed as Outputs

## ECSServiceStack
This stack builds the ECS Service, as well as Task Definition and adds the container for what wordpress with  WooCommerce plugin will reside on.

# MySQLStack
This stack builds a MySQL instance in the RDS Service. It's a very basic configuration. Need more time to flesh it out more.

## ECRStack

A ECR Repository needed to store docker images built during the CI/CD Pipeline process

## DNSFrontStack

A stack that creates the dns records for the wordpress woocommerce site. The DNS record is an alias to the Cloudfront distribution also created in this stack. The CloudFront Distribution links to the Application load balancer used for the green blue deployment


## MediaStack. 

A S3 bucket stack to host asssets for wordpress, access through the CloudFront distribution also setup for it.


# CI/CD Pipeline

## CICDCdkStack

For this infastructure, the folowing CI/CD Pipeline is needed

## Source 

When files are merged into the main branch within github, this would Kick off and perform a git clone in a CI/CD Pipeline container needed for deployment
 
## Build

Perform a build of the product (WooCommence), making sure it was running smoothly. Also run any unit tests needed

## Build Container

The Output of Build would then be used to build a container container of with wordpress running on there (latest build). This would be then commited to ECR 

## Approval

If everything is going well so far, we approval it so that we can see our changes in our staging environment

## Deploy to Staging

This would deploy using ECS Deploy. Ran out of time to build this properly.

This would be the blue environment. Testing out the blue environment to make sure everything working as expected.

## Deploy to Production

Once things are checked and good to go, make the switch, and make the latest container go live on production.

