# Create a decorator 
# Decorator - simply wrapper to existing function
import inspect

# Composition of decorators
def p_dec(func):
     # Print the wrapper function name
    current_frame = inspect.currentframe()
    print "Wrapper : ",inspect.getframeinfo(current_frame).function
    def func_wrapper(name):
        print "Function name :{0} ".format(func.__name__)
        return '<p>{0}</p>'.format(func(name))
    return func_wrapper

def get_text(name):
    return 'lorem ipsum {} lorem ipsum'.format(name)    

# Get the returned function
get_text_func = p_dec(get_text)

print get_text_func("Andrei")


# Decorators Syntax - name the decorating function before the function to be decorated!
# The name of the decorator must be prepended with an "@"
@p_dec
def get_text_v2(name):
    return 'Hello, {} ! '.format(name)

print get_text_v2("Andrei")


# Use more decorators

# Italic decorator 
def italic_dec(func):
    # Print the wrapper function name
    current_frame = inspect.currentframe()
    print "Wrapper : ",inspect.getframeinfo(current_frame).function
    def func_wrapper(name):
        print "Function name :{0} ".format(func.__name__)
        return '<i>{0}</i>'.format(func(name))
    return func_wrapper


# Div decorator
def div_dec(func):
    # Print the wrapper function name
    current_frame = inspect.currentframe()
    print "Wrapper : ",inspect.getframeinfo(current_frame).function
    # I have called this in a different way just to see that this is the function returned
    def func_wrapper_div(name):
        print "Function name :{0} ".format(func.__name__)
        return '<div>{0}</div>'.format(func(name))
    return func_wrapper_div # Return the function


#! Basic approach
print "-------BASIC APPROACH--------------"
# The inner function of the wrapper function is returned here
print_text = div_dec(p_dec(italic_dec(get_text)))
print "Last function returned : ", print_text
# Here we pass the parameter
print print_text("Andrei Gatej") # <div><p><i>lorem ipsum Andrei Gatej lorem ipsum</i></p></div>

print ('')
# We could get the above result by doing this : 
print "<div>{0}</div>".format("<p>{0}</p>".format("<i>{0}</i>").format("Andrei Gatej")) # <div><p><i>Andrei Gatej</i></p></div>
print ('')


print "-------DECORATORS APPROACH-----------"
#* Decorators approach
@div_dec
@p_dec
@italic_dec 
def get_text_v3(name):
    return 'My name is {0}'.format(name)

print get_text_v3("Andrei") # <div><p><i>My name is Andrei</i></p></div>

