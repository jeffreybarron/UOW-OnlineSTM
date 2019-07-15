import os
import json
import re


def set_default(obj):
    if isinstance(obj, set):
        return list(obj)
    raise TypeError


cwd_path = os.getcwd()  # current working directory (cwd)

# ---- console message ---
print("=================================================")
print("Prep2 is Processing: processed-1.json")
print("current directory is : " + cwd_path)
print("=================================================")

# --- Open file ----
log_processed = open(cwd_path + '/processed-1.json', 'r')
log_data = json.load(log_processed)
log_processed.close()

# --- processfile by line ---
for item in log_data:
    # --- breakdown message elements ---
    s_find = " [ { studyName:"
    l_find = len(s_find)
    item_msg = item['msg']
    if s_find in item_msg:
        pos1 = item_msg.find(s_find)
        part_a = item_msg[0:pos1]
        part_b = s_find + item_msg[pos1: len(item_msg)]
        # --- seperate into objects ---
        # item['msg'] = [{'path': part_a}, {'data': part_b}]
        # --- seperate into elements ---
        part_b = part_b.replace('"', "'")  # first turn singles into doubles
        # part_b = part_b.replace("'", '"')  # first turn singles into doubles
        part_b = part_b.replace('`', '"')  # then backtick into single
        item['msg'] = {'path': part_a, 'data': part_b}

# --- testing serialization ---
# log_serialized = json.dumps(log_data, indent=4, default=set_default)
# print(log_serialized)

# --- output ---
log_processed_2 = open(cwd_path + '/processed-2.json', 'w')
json.dump(log_data, log_processed_2, indent=4, default=set_default)
log_processed_2.close()


# the problem is the large msg values
# they are not serialised properly ..
