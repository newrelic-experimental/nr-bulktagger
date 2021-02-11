
var axios = require('axios')
const fs = require('fs');
const readline = require('readline');
const path = require('path');

if(process.argv.length < 4)
{
    console.log("not enough arguments, please include both a key and value (2 arguments")
    return;
}
const TAG_KEY = process.argv[2];
const TAG_VALUE = process.argv[3];

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

console.log("key : value   " + TAG_KEY + ":"+ TAG_VALUE);
console.log("=======================================");

const file = readline.createInterface({
    input: fs.createReadStream('entity_guid_list.txt'),
    output: process.stdout,
    terminal: false
});

var sendcount = 0;

console.log("Processing GUID file...");


file.on('line', (line) => {

    sendcount++;
    var consolelogline = sendcount;
    var guidval = line.trim()
    consolelogline += ":   " + guidval;

    var data2 = JSON.stringify({
        query: `mutation ($guidval: EntityGuid!, $tag_key: String!, $tag_value: String!) {
    taggingAddTagsToEntity(guid: $guidval,tags: { key: $tag_key, values: [$tag_value]}) {
            errors {
                message
            }
        }
     }`,
        variables: {"guidval":guidval, "tag_key": TAG_KEY, "tag_value": TAG_VALUE}
    });

    var config = {
        method: 'post',
        url: 'https://api.newrelic.com/graphql',
        headers: {
            'Content-Type': 'application/json',
            'API-Key': API_KEY
        },
        data : data2
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

console.log("Bulk tag complete.");
