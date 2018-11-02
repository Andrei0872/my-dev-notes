
# https://realpython.com/python-dicts/

#* Dictionaries
# Elements accessed by key

'''
#!Restrictions : 
- a given key can appear only once
- values can be override each other
'''

#! Neither a list or another dictionary can serve as a key
# An object must be hashable(can be passed to a hash function)
#* hash function : takes data of arbitrary size and maps it to relatively simpler fixed size

d = {
    (1,1) : 'a',
    (1,2) : 'b',
    (3,3) : (33,33)
}

# print(d[(3,3)], d[(1,2)])

# ===========================================

# "not" and "in" return True or False according to the key existence

MLB_team = {
    'Colorado' : 'Rockies',
    'Boston'   : 'Red Sox',
    'Minnesota': 'Twins',
    'Milwaukee': 'Brewers',
    'Seattle'  : 'Mariners'
}

print('Colorado' in MLB_team) # True
print('Toronto' in MLB_team) # False


# ==============================================

# get(key) 
print(MLB_team.get('Colorado'))

# items() - key-value pairs in a dictionary
print(MLB_team.items()) # [('Seattle', 'Mariners'), ('Boston', 'Red Sox'), ('Minnesota', 'Twins'), ('Colorado', 'Rockies'), ('Milwaukee', 'Brewers')

# keys() - keys

# values() - values

# pop(key)

# popitem() - remove a random key-value

# update(another obj)



