import boto3
import json

dynamodbTableName = 'admin'

rekognition = boto3.client('rekognition', region_name='us-east-1')
s3 = boto3.client('s3')
dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
adminTable = dynamodb.Table(dynamodbTableName)
bucketName = 'project-visitorsbucket'

def lambda_handler(event, context):
    print('Trigger event: ', event)
    objectKey = event['queryStringParameters']['objectKey']
    image_bytes = s3.get_object(Bucket=bucketName, Key=objectKey)['Body'].read()
    response = rekognition.search_faces_by_image(
        CollectionId='admins',
        Image={'Bytes': image_bytes}
    )

    for match in response['FaceMatches']:
        print(match['Face']['FaceId'], match['Face']['Confidence'])

        face = adminTable.get_item(
            Key={
                'rekognitionId': match['Face']['FaceId']
            }
        )
        if 'Item' in face:
            print('Person found: ', face['Item'])
            return buildResponse(200, {
                'Message': 'Success',
                'firstName': face['Item']['firstName'],
                'lastName': face['Item']['lastName']
            })
    print('Person could not be recognized')
    return buildResponse(403, {'Message': 'Person could not be recognized'})

def buildResponse(statusCode, body):
    response={
        'statusCode': statusCode,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    }
    if body is not None:
        response['body'] = json.dumps(body)
    return response