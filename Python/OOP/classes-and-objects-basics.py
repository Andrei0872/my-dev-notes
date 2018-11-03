
from datetime import date

# Classes and Objects

# Class - Object constructor, a "blueprint" for creating objects


# A class in its simplest form
class MyClass:
    x = 5

p1 = MyClass()
print(p1.x)  # 5 



#* __init__() function - it is always executed when the class is being initiated
#* __init__() - it is a constructor

class Person:
    # Set the constructor function
    def __init__(self,name,age):
        print("Person class initialized!")  # Prints before "print(myself.name)" and  "print(myself.age)"
        self.name = name
        self.age = age

    # Adding a methood 
    # self parameter - to reference to the class itself
    # It does not have to be named "self", but it has to be the first parameter of any function in the class
    def describe(self):
        print("My name is " + self.name + " and I'm " + str(self.age) + " years old")    

    #* Factory method - method wich returns a class object (like constructor)
    @classmethod
    def getClassName(self):
        return self.__name__

    # Return the class object
    @classmethod
    def getClassName2(cls,name,birthYear):
        # cls acts as the __init__() function
        return cls(name, date.today().year - birthYear)

    # __str__ - print object
    def __str__(self):
        return self.name + ", " + str(self.age)

    def printProps(self):
        for key,val in self.__dict__.iteritems():
            print key, ": ",val



# Create a new instance 
myself = Person("Andrei",17)

print "name : ",(myself.name) # Andrei
print "age : ",(myself.age) # 17
myself.describe() # My name is Andrei and I'm 17 years old
print "\n"

# Modify object properties
myself.age = 18
myself.describe() # My name is Andrei and I'm 18 years old
print "\n"


#* myself.__class__  - the string version of the class includes the module that is defined in
#? print myself.__class__ is Person # True
 
  
#* First alternative to get class name
print "class name : ",myself.__class__.__name__, "\n" # Person
#! the __name__ attr of the class DOES NOT INCLUDE THE MODULE

"""
#! DOESN'T WORK because we are using local variable instead of instance variable
"""
# print myself.__name__ #! ERROR

#* Second alternative to get class name
print "class name : ",myself.getClassName(), "\n"


#* Person.getClassName2 - returns the class obj
person2 =  Person.getClassName2("Marius",1979)
print "person2 : ",person2

#var
print "vars(myself) : ", vars(myself), "\n" # {'age': 18, 'name': 'Andrei'}

print "myself.__dict__ : ", myself.__dict__, "\n" # {'age': 18, 'name': 'Andrei'}


# for key,val in myself.__dict__.iteritems():
#     print key, ": ", val # age : 18, name : Andrei 


# Enumerate object properties
print "object properties : "
myself.printProps()

