
var axios = require('axios')
const fs = require('fs');
const readline = require('readline');
const path = require('path');



if(process.argv.length < 4)
{
    console.log("not enough arguments, please include an action(add/delete) and  a key:value (in that format with a colon")
    return;
}

const ACTION = process.argv[2].toLowerCase().trim();
const TAG_KEY_VALUE = process.argv[3];
var TAG_KEY = "";
var TAG_VALUE = "";

if(ACTION === 'add')
{
    var parts = TAG_KEY_VALUE.split(":");
    if(parts.length != 2)
    {
        console.log("Error parsing tag key or value, please format as:    tagkey:tagvalue")
        return; 
    }
    else
    {
        
        TAG_KEY = parts[0];
        TAG_VALUE = parts[1];
        console.log("Performing Tag Add Action: " + TAG_KEY + " : " + TAG_VALUE);
    } 
}
else if (ACTION === 'delete')
{
   // for delete we only expect a key.
   console.log("Performing Tag Delete Action: "+ TAG_KEY); 
   TAG_KEY = TAG_KEY_VALUE;
}
else
{
    console.log("Error, invalid action,  valid actions are :  add or delete")
    return;
}


var API_KEY = "";
// fetch apk key from file called api_key.txt

try {
    if(fs.existsSync('api_key.txt')) {
        const data = fs.readFileSync('api_key.txt', 'utf8');
        API_KEY = data;
    }
    else
    {
        console.log("api_key.txt file is not found, please check");
        return;
    }


    if(API_KEY.length <= 0)
    {
        console.log("invalid api key, please check file");
        return;
    }
} catch (err) {
    console.error(err)
}

console.log("=======================================");

const file = readline.createInterface({
    input: fs.createReadStream('entity_guid_list.txt'),
    output: process.stdout,
    terminal: false
});

var sendcount = 0;

console.log("Processing GUID file...");

file.line

file.on('line', (line) => {

    sendcount++;
    var consolelogline = sendcount;
    var guidval = line.trim()
    consolelogline += ":   " + guidval;

    var datapayload = "";

    if(ACTION === 'add')
    {
        datapayload = JSON.stringify({
            query: `mutation ($guidval: EntityGuid!, $tag_key: String!, $tag_value: String!) {
        taggingAddTagsToEntity(guid: $guidval,tags: { key: $tag_key, values: [$tag_value]}) {
                errors {
                    message
                }
            }
         }`,
            variables: {"guidval":guidval, "tag_key": TAG_KEY, "tag_value": TAG_VALUE}
        });
    }
    else
    {
        datapayload = JSON.stringify({
            query: `mutation ($guidval: EntityGuid!, $tag_key: String!, $tag_value: String!) {
        taggingDeleteTagsToEntity(guid: $guidval,tagKeys:  $tag_key) {
                errors {
                    message
                }
            }
         }`,
            variables: {"guidval":guidval, "tag_key": TAG_KEY}
        });
    }


  

    var config = {
        method: 'post',
        url: 'https://api.newrelic.com/graphql',
        headers: {
            'Content-Type': 'application/json',
            'API-Key': API_KEY
        },
        data : datapayload
    };

    axios(config)
        .then(function (response) {
            if(response.status == 200) {
                consolelogline += "   ===>  success"
            }
            else {
                consolelogline += " failed"
            }
            console.log(consolelogline);
          //  console.log(JSON.stringify(response.data));
        })
        .catch(function (error) {
            consolelogline += " exception";
            console.log(consolelogline);
            //console.log("exception: " + error);
        });
});



file.on('close', () => {

    console.log("Bulk tag processing is complete." + sendcount + " items");
});

