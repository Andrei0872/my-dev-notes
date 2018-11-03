
# Memoization - cache results of a function

class Mem:
    
    def __init__(self):
        # Initialize cache array
        self.cache = {}

    # Where we will apply the concept
    def mem_func(self,value):
        print "cache : ", self.cache
        # Check if value is already in the cache -  we are looking for the key now
        if value in self.cache:
            print "Value already in array :%d" % value
            return self.cache[value]
        else:
            # Store the value
            self.cache[value] = factorial(value)


def factorial(n):
    return n if n == 1 else n * factorial(n-1)


mem = Mem()

mem.mem_func(4)
mem.mem_func(4)
mem.mem_func(5)
mem.mem_func(3)
mem.mem_func(5)