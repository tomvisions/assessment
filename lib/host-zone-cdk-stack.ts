import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as route53 from 'aws-cdk-lib/aws-route53';
import { CfnOutput } from 'aws-cdk-lib';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';

const zoneName = 'tc-testing.xyz';
const domainName = `*.${zoneName}`;

export class HostZoneCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);


    const hostedZone = new route53.PublicHostedZone(this, 'HostedZone', {
      zoneName: zoneName,
    });

    const certificate = new acm.Certificate(this, 'SiteDomainCertification', {
      domainName: domainName,
      certificateName: 'Site Certification', // Optionally provide an certificate name
      validation: acm.CertificateValidation.fromDns(hostedZone),
    });

    new CfnOutput(this, 'hostedZoneArn', { value: hostedZone.hostedZoneArn, exportName: "hostedZoneArn" });
    new CfnOutput(this, 'hostedZoneId', { value: hostedZone.hostedZoneId, exportName: "hostedZoneId" });
    new CfnOutput(this, 'hostedZoneName', { value: hostedZone.zoneName, exportName: "hostedZoneName" });
    
    new CfnOutput(this, 'siteCertificationArn', { value: certificate.certificateArn, exportName: "siteCertificationArn" });

  }
}