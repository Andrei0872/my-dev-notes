
# https://www.datacamp.com/community/tutorials/decorators-python

#* What is a decorator ? 
# - a design pattern that allows a user to add new functionality
# to an existing object without modifying its structure

# Functions - first class citizens(they support operations such as being passed 
# as an argument, returned from a function, modified, assigned to a variable)


#* Passing Functions as Arguments to other Functions
def plus_one(number) :
    return number + 1

def funciton_call(function):
    number_to_add = 5
    return function(number_to_add)

# print(funciton_call(plus_one)) # 6

# Nested Functions have access to the Enclosing Function's Variable Scope

#* Creating Decorators
def uppercase_decorator(function):
    def wrapper():
        func = function()
        make_uppercase = func.upper()
        return make_uppercase
    return wrapper

def say_hi():
    return "hello there!"

# decorate = uppercase_decorator(say_hi)
# print(decorate()) # HELLO THERE!

# Using decorators
@uppercase_decorator
def say_hi2():
    return "hello there!!"

# print(say_hi2()) # HELLO THERE!!

#* Applying Multiple Decorators to a single function
def split_string(function):
    def wrapper():
        func = function()
        splitted_string = func.split()
        return splitted_string
    return wrapper


# The application of decorators is from the bottoom up
# Had we interchanged the order, we'd have seen an error since lists
# don't have an "upper" attribute
# The sentence has been converted to uppercase and then split into a list
@split_string
@uppercase_decorator
def say_hi3():
    return "Multiple Decorators"

# print(say_hi3()) # ['MULTIPLE', 'DECORATORS']


#* Acception Arguments in Decorator Function
# Pass the args to the wrapper function
# The args will then be passed to the function that is being
# decorated at call time

def decorator_with_arguments(function):
    def wrapper_accepting_arguments(arg1, arg2):
        print("My arguments are : {0:^3}, {1}".format(arg1, arg2))
        function(arg1,arg2)
    return wrapper_accepting_arguments

@decorator_with_arguments
def cities(city1, city2):
    print("Cities that I love are {0} and {1}".format(city1,city2))

cities("Cluj","Copenhaga")


#* Defining General Purpose Decorators
# Use "args" and "**kwargs"
# "args" and "**kwargs" : positional and keyword args and stores them
# in the "args" and "kwarags" variables

def a_decorator_passing_arbitrary_arguments(function_to_decorate):
    def a_wrapper_accepting_arbitrary_arguments(*args,**kwargs):
        print('The positional arguments are', args)
        print('The keyword arguments are', kwargs)
        function_to_decorate(*args)
    return a_wrapper_accepting_arbitrary_arguments

@a_decorator_passing_arbitrary_arguments
def function_with_no_args():
    print("No args")

# function_with_no_args()  

@a_decorator_passing_arbitrary_arguments
def func_with_args(a,b,c):
    print(a,b,c)

# func_with_args(1,2,3) # ('The positional arguments are', (1, 2, 3))

@a_decorator_passing_arbitrary_arguments
def func_with_keyword_args():
    print("this has shown keywod args")

# func_with_keyword_args(first_name="Gatej",last_name="Andrei") 
# ('The keyword arguments are', {'first_name': 'Gatej', 'last_name': 'Andrei'})


#* Passing Arguments to the Decorator
# We need to define a decorator marker that accepts arguments then
#* define a decorator inside it
# We then define a wrapper function inside the decorator as we did earlier

def decorator_maker_with_arguments(decorator_arg1, decorator_arg2, decorator_arg3):
    def decorator(func):
        def wrapper(func_arg1,func_arg2,func_arg3):
            print("The wrapper can access all the variables\n"
                  "\t- from the decorator maker: {0} {1} {2}\n"
                  "\t- from the function call: {3} {4} {5}\n"
                  "and pass them to the decorated function"
                  .format(decorator_arg1, decorator_arg2,decorator_arg3,
                            func_arg1, func_arg2,func_arg3))
            return func(func_arg1,func_arg2,func_arg3)
        return wrapper
    return decorator

pandas = "Pandas"
@decorator_maker_with_arguments(pandas,"And","Gtj")
def decorated_func_with_args(func_arg1, func_arg2,func_arg3):
    print("This is the decorated function and it only knows about its arguments: {0}  {1}" " {2}".format(func_arg1, func_arg2,func_arg3))


# decorated_func_with_args("ARG1","ARG2","ARG3")


# Decorators wrap functions
# The original func name, its docstring and param list
# are all hidden by the wrapper closure

# print(decorated_func_with_args.__name__) # wrapper

#* functools.wraps decorator - copies all lost metadata from the undecorated function
#* to the decorated closure

import functools
def upp_dec(func):
    # Preserve the original data
    @functools.wraps(func)
    def wrapper():
        return func().upper()
    return wrapper


@upp_dec
def say_hi4():
    return "say hi"

# print(say_hi4()) # SAY HI
# print(say_hi4.__name__) # say_hi4

#* Summary
'''
Decorators dinamically alter the functionality of a function,
method, or class without having to directly use subclasses or
change the source code of a func 
Using decorators - DRY

Use cases : 
- Authorization in Python frameworks such as Flask and Django
- Logging
- Measuring execution time
- Synchronization
'''

