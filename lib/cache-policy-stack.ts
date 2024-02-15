import {Stack, StackProps}from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CfnOutput, Duration } from 'aws-cdk-lib';
import {CacheCookieBehavior, CacheHeaderBehavior, CacheQueryStringBehavior} from 'aws-cdk-lib/aws-cloudfront';
import {CachePolicy} from "aws-cdk-lib/aws-cloudfront";


export class CachePolicyStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const cachePolicy = new CachePolicy(this, 'cachePolicyCloudfront', {
        cachePolicyName: 'dynamics-year-policy',
        comment: 'A policy to expire objects within a year',
        defaultTtl: Duration.days(365),
        minTtl: Duration.minutes(1),
        maxTtl: Duration.days(365),
        cookieBehavior: CacheCookieBehavior.none(),
        headerBehavior: CacheHeaderBehavior.none(),
        queryStringBehavior: CacheQueryStringBehavior.none(),
        enableAcceptEncodingGzip: true,
        enableAcceptEncodingBrotli: true,
      });
  
    new CfnOutput(this, 'oneYearCachePolicyId', { value: cachePolicy.cachePolicyId, exportName: "oneYearCachePolicyId" });
  }
}