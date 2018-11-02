
# Count occurrences of char in string
# https://stackoverflow.com/questions/52462898/counting-occurences-of-char-in-string

string1 = "aaaabbcaaddd"

# First Solution
prev, finalstr, finalInt = ("","",1)
for index, val in enumerate(string1):
    if index > 0:
        prev = string1[index-1]
        if prev == val:
            finalInt += 1
        else :
            finalstr += prev + str(finalInt)
            # Reset value
            finalInt = 1

finalstr += prev + str(finalInt)
print(finalstr) # a4b2c1a2d3


# Second Solution
from itertools import groupby
# groupby() docs : https://docs.python.org/2/library/itertools.html#itertools.groupby
'''
It generates  a break or a new group every time the value of the
key function changes (it is recommended to have sorted the data )
The returned group is itself an iterator
'''

res = [k for k,v in groupby(string1)]
#print(res) # ['a', 'b', 'c', 'a', 'd']

res2 = [list(v) for k,v in groupby(string1) ]
#print(res2) # [['a', 'a', 'a', 'a'], ['b', 'b'], ['c'], ['a', 'a'], ['d', 'd', 'd']]

result = ''.join(char  + str(len(list(group))) for char,group in groupby(string1))
print(result) # a4b2c1a2d3


# Third Solution - withoud indexes
cnt = 1
finalString = ""
gr = zip(string1, string1[1:])
#print(gr)
for x,y in gr:
    if x == y:
        cnt +=1
    else :
        finalString += x + str(cnt)
        cnt = 1
# Because the last "else" would never be encountered within the loop 
finalString += x + (str(cnt) if cnt > 1 else '')
print(finalString) # a4b2ca2d3


# Fourth Solution - using groupby() and string formatting
string2 = "";
for c,v in groupby(string1):
    # c - the key
    # v - the entire group
    # string2 += "%s%s"%(c,len(list(v)))
    string2 += "{0}{1}".format(c,len(list(v)))
print(string2) # a4b2c1a2d3