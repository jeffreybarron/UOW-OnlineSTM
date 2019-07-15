import os
import json

cwd_path = os.getcwd()  # current working directory (cwd)
print("=================================================")
print("Prep1 is Processing: ostm-log.json")
print("current directory is : " + cwd_path)
print("=================================================")
log_file = open(cwd_path + '/ostm/logs/' + 'ostm-log.json', 'r')
log_processed = open(cwd_path + '/processed-1.json', 'w')

for line in log_file:
    line_temp = line.replace('`', "'")
    line_temp = line.replace('} {', '},{')
    log_processed.write(line_temp)

log_file.close()
log_processed.close()
