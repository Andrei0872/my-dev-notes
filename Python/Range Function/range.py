
# https://realpython.com/python-range/

#range() - can only take integers as arguments
#* range() in Python 3 === xrange() in Python 3

# range() - generate a list of those numbers all at once..
# xrange() - produced numbers lazily - were returned one at a time as they were needed


for i in range(3,16,3):
    quotient = i / 3
    print("{} divided by 3 is {}.".format(i, int(quotient)))

#! It's usually frowned upon to use range() too ofter in for-loops

# range() - great for creating iterables of numbers
#! not the best choice when you need to iterate over data that could be 
#! looped over with the "in" operator 


# range(start, stop, step) takes three arguments.

# Decrementing with range()
for i in range(10,-6,-2):
    print(i) # 10 8 6 4 2 0 -2 -4

# for i in reversed(range(5)):
#     print(i)

#* Main uses 
# 1) Executing the body of a for-loop a specific number of times
# 2) Creating more efficient iterables of integers that can be done using lists or tuples

# range() is a type
print(type(range(3))) # <class 'range'>

# access items by index
print(range(3)[2]) # 2



#* Using NumPy
import numpy as np

for i in np.arange(0.3,1.6,0.3):
    print(i)