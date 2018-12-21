ipsum_file = open('colors.html')


# ipsum_file.seek(0)
# lines = ipsum_file.readlines()
# print(lines)


def sequence_filter(line)
    return '    <td><a target="_blank" href="color_tryit.asp?' in lines

with open('dna_sequence.txt') as dna_file:
    lines = dna_file.readlines()
    print(list(filter(sequence_filter,lines)))
