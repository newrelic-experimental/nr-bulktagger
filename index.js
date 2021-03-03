var axios = require('axios');
const csvreader = require('csv-parser');
const fs = require('fs');
const readline = require('readline');
const path = require('path');

var ACTION = ""; //process.argv[2].toLowerCase().trim();
var TAG_KEY_VALUE = ""; //process.argv[3];
var TAG_KEY = "";
var TAG_VALUE = "";



if(process.argv.length < 3)
{
    console.log("Invalid parameters, need atleast one parameter");
    return;
}

// you have atleast one param: 

ACTION = process.argv[2].toLowerCase().trim();

/**
 * util function to send out the tags to NewRelic
 * @param {} datapayload 
 * @param {*} callback 
 */
function dispatchToNewRelic(datapayload, callback)
{
    var config = {
        method: 'post',
        url: 'https://api.newrelic.com/graphql',
        headers: {
            'Content-Type': 'application/json',
            'API-Key': API_KEY
        },
        data: datapayload
    };

    axios(config)
        .then(function (response) {
            if (response.status == 200) {
                if(response.data.errors != null)
                {
                    callback("failed: " + JSON.stringify(response.data.errors));
                }
                else
                   callback("success");     
            }
            else {
                callback("failed");
            }
        })
        .catch(function (error) {
            callback("exception" );    
        });
}


// start of handlers... 
if (ACTION === 'add') {

    if(process.argv.length != 4)
    {
        console.log("Invalid parameters, should be:   add  tagkey:tagvalue")
        return;
    }

    if(!fs.existsSync( 'entity_guid_list.txt' ))
    {
        console.log("Error:  entity_guild_list.txt file does not exist in root path");
        return;
    }

    TAG_KEY_VALUE =  process.argv[3];
    var parts = TAG_KEY_VALUE.split(":");
    if (parts.length != 2) {
        console.log("Error parsing tag key or value, please format as:    tagkey:tagvalue")
        return;
    }
    else {
        TAG_KEY = parts[0];
        TAG_VALUE = parts[1];
        console.log("Performing Tag Add Action: " + TAG_KEY + " : " + TAG_VALUE);
    }
}
else if (ACTION === 'delete') {
    if(process.argv.length != 4)
    {
        console.log("Invalid parameters, should be:   delete  tagkey")
        return;
    }

    if(!fs.existsSync( 'entity_guid_list.txt' ))
    {
        console.log("Error:  entity_guild_list.txt file does not exist in root path");
        return;
    }

    TAG_KEY_VALUE = process.argv[3];
    TAG_KEY = TAG_KEY_VALUE;
    // for delete we only expect a key.
    console.log("Performing Tag Delete Action: " + TAG_KEY);
  
}
else if (ACTION === 'addcsv') {
    console.log("Performing Tag Add Tags per CSV file, looking for entity_guid_list.csv");
    // were ok.. look for csv file (todo) 
}
else {
    console.log("Error, invalid action,  valid actions are :  add or delete")
    return;
}


var API_KEY = "";
// fetch apk key from file called api_key.txt

try {
    if (fs.existsSync('api_key.txt')) {
        const data = fs.readFileSync('api_key.txt', 'utf8');
        API_KEY = data.replace(/(\r\n|\n|\r)/gm, "");// remove /r/n
        console.log("APIKEY FOUND: " + API_KEY);
    }
    else {
        console.log("api_key.txt file is not found, please check");
        return;
    }


    if (API_KEY.length <= 0) {
        console.log("invalid api key, please check file");
        return;
    }
} catch (err) {
    console.error(err)
}

console.log("=======================================");


// version 2... tags are in the guid list file... 
if (ACTION == 'addcsv') {
    var headers_cache = [];
    try {

        const file = readline.createInterface({
            input: fs.createReadStream('entity_guid_list.csv'),
            output: process.stdout,
            terminal: false
        });

        var sendcount = 0;
        var linecount = 0;
        console.log("Processing GUID CSV TAGS file...");

    
        var headers_cache
        file.on('line', (line) => {

            if (linecount <= 0) {
                // assume header/,, store. 
                headers_cache = line.split(",");

                if (headers_cache.length < 2) {
                    console.log("Incorrect headers, must have atleast 2 columns, a guid + 1 min ");
                    return;
                }
                for (var i = 0; i < headers_cache.length; i++) {
                    headers_cache[i] = headers_cache[i].trim(); //remove all spaces 
                }
            }
            else {
                sendcount++;
                var consolelogline = sendcount;
                var parts = line.split(",");

                if (parts.length != headers_cache.length) {
                    console.log("Incorrect number of columns on line: " + linecount + "  .... skipping ");
                    return;
                }

                var values = []
                for (var k = 0; k < parts.length; k++) {
                    values[k] = parts[k].trim();
                }
                var guidval = values[0];
                consolelogline += ":   " + guidval;

                var tags_array = []; //create tags array to send down. 
                for(var i = 1 ; i < values.length; i++)
                {
                    var obj = {};
                    obj.key = headers_cache[i];
                    obj.values = values[i];
                    tags_array.push(obj);
                    consolelogline += " |   " + values[i];
                }

                datapayload = JSON.stringify({
                    query: `mutation ($guidval: EntityGuid!, $tag_data: [TaggingTagInput!]! ) {
                    taggingAddTagsToEntity(guid: $guidval,tags: $tag_data) {
                            errors {
                                message
                            }
                        }
                    }`,
                    variables: { "guidval": guidval, "tag_data": tags_array }
                });


                dispatchToNewRelic(datapayload, function(result){
                    consolelogline += " : " + result;
                    console.log(consolelogline);
                })
            }
            linecount++;

        });

    } catch (ex1) {
        console.log("Caught Exception during csv processing/sending: " + ex1);
    }

}
else if (ACTION == 'add' || ACTION == 'delete') {  //  Line by line,,, guid only way  v1 
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

        var datapayload = "";

        if (ACTION === 'add') {
            datapayload = JSON.stringify({
                query: `mutation ($guidval: EntityGuid!, $tag_key: String!, $tag_value: String!) {
        taggingAddTagsToEntity(guid: $guidval,tags: { key: $tag_key, values: [$tag_value]}) {
                errors {
                    message
                }
            }
         }`,
                variables: { "guidval": guidval, "tag_key": TAG_KEY, "tag_value": TAG_VALUE }
            });
        }
        else {
            datapayload = JSON.stringify({
                query: `mutation ($guidval: EntityGuid!, $tag_key: String!) {
        taggingDeleteTagFromEntity(guid: $guidval,tagKeys:  [$tag_key]) {
                errors {
                    message
                }
            }
         }`,
                variables: { "guidval": guidval, "tag_key": TAG_KEY }
            });
        }

        dispatchToNewRelic(datapayload, function(result){
            consolelogline += " : " + result;
            console.log(consolelogline);
        })
    });


    file.on('close', () => {
        // console.log("Bulk tag processing is complete." + sendcount + " items");
    });


}


