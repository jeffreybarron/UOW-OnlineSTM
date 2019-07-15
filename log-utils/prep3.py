import os
import json
import yaml


cwd_path = os.getcwd()  # current working directory (cwd)
print("=================================================")
print("Prep3 is Processing: processed-2.json")
print("current directory is : " + cwd_path)
print("=================================================")

log_processed = open(cwd_path + '/processed-2.json', 'r')
log_data = json.load(log_processed)
log_processed.close()


for item in log_data:
    if isinstance(item['msg'], dict):
        item_data = item['msg']['data']
        print(item['msg']['data'])

layoutContent > layoutLoaded
viewContent > viewLoaded


        item_deserialized = yaml.load(item['msg']['data'])
        # print("dict type")


print("eof")

# s_find = " [ { studyName:"
# l_find = len(s_find)
# item_msg = item['msg']
# if s_find in item_msg:
#     pos1 = item_msg.find(s_find)
#     part_a = item_msg[0:pos1] + '"'
#     part_b = s_find + item_msg[pos1: len(item_msg)]
#     item['msg'] = '{"path":"' + part_a + ', "data":"' + part_b + '"}'
#     # print(json.loads(item['msg']))
#     # item['msg'] = {'path': part_a, 'data': json.loads(part_b)}

# log_processed_2 = open(cwd_path + '/processed-2.json', 'w')
# json.dump(log_data, log_processed_2, indent=4)
# log_processed_2.close()


# the problem is the large msg values
# they are not serialised properly ..
