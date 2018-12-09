import re

#* Look Arounds 

# =============================================

# Look Arounds don't consume
# allow us to confirm some subpattern that is ahead or behind the main pattern
# used for assertion

# =============================================

# positive look ahead ?=
# negative look ahead ?!
# positive look behind ?<=
# negative look behind ?<!

# =============================================

#* Similar syntax
# ?: - non-capturing groups
# ?P - naming groups

# =============================================

# Consume the second col only if the first col starts with 'ABC' 
# and the last col is 'active'

string ='''ABC1    1.1.1.1    20151118    active
           ABC2    2.2.2.2    20151118    inactive
           ABC3    x.x.x.x    xxxxxxxx    active'''

pattern = re.compile('ABC\w\s+(\S+)\s+\S+\s+(?=active)') # Positive look ahead
print(re.findall(pattern, string)) # ['1.1.1.1', 'x.x.x.x']

pattern2 = re.compile('ABC\w\s+(\S+)\s+\S+\s+(?=inactive)') # Positive look ahead
print(re.findall(pattern2, string)) # ['2.2.2.2']

pattern3 = re.compile('ABC\w\s+(\S+)\s+\S+\s+(?:active)') # Non-capturing group (it consumes)
print(re.findall(pattern3, string)) # ['1.1.1.1', 'x.x.x.x']

# =============================================

# Whenever 'a' is surrounded by 'b'
string = 'abababacb'
pattern = re.compile('(?:b)(a)(?:b)')
print(re.findall(pattern, string)) # ['a'] - because the second 'b' is already consumed

pattern2 = re.compile('(?<=b)(a)(?=b)')
print(re.findall(pattern2, string)) # ['a', 'a'] - the second 'b' is not consumed (just checks, then comes back to where it was initially)

# =============================================

# Capture the entire look ahead
string = 'abababacb'
pattern = re.compile('(?=(bab))')
print(re.findall(pattern, string)) # ['bab', 'bab']

pattern2 = re.compile('(?:(bab))')
print(re.findall(pattern2, string)) # ['bab'] - The path goes like this: aba->bab->acb

# =============================================

# Another example of positive look ahead
# Look for any word that is followed by a punctuation mark
string = 'I love cherries, apples, and strawberries.'
pattern = re.compile(r'(\w+)(?=\.|,)')
print(re.findall(pattern, string)) # ['cherries', 'apples', 'strawberries']

pattern2 = re.compile(r'(\w+)(?:\.|,)')
print(re.findall(pattern2, string))