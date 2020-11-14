#!/bin/bash
aws s3 cp ./ s3://virtualsantadash.org.uk --grants read=uri=http://acs.amazonaws.com/groups/global/AllUsers --recursive --exclude=.git*