#!/usr/bin/env bash

BUCKET=eclipse-animation


echo "Removing all files on bucket"
aws s3 rm s3://${BUCKET} --recursive --profile=a1


aws s3 sync . s3://${BUCKET}/ --profile=a1
echo "S3 Upload complete"