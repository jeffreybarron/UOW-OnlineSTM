def fixJSON(jsonStr):
    # First remove the " from where it is supposed to be.
    jsonStr = re.sub(r'\\', '', jsonStr)
    jsonStr = re.sub(r'{"', '{`', jsonStr)
    jsonStr = re.sub(r'"}', '`}', jsonStr)
    jsonStr = re.sub(r'":"', '`:`', jsonStr)
    jsonStr = re.sub(r'":', '`:', jsonStr)
    jsonStr = re.sub(r'","', '`,`', jsonStr)
    jsonStr = re.sub(r'",', '`,', jsonStr)
    jsonStr = re.sub(r',"', ',`', jsonStr)
    jsonStr = re.sub(r'\["', '\[`', jsonStr)
    jsonStr = re.sub(r'"\]', '`\]', jsonStr)

    # Remove all the unwanted " and replace with ' '
    jsonStr = re.sub(r'"',' ', jsonStr)

    # Put back all the " where it supposed to be.
    jsonStr = re.sub(r'\`','\"', jsonStr)

    return json.loads(jsonStr)