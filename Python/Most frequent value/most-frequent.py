

numbers = [1,2,7,4,5,7,8,7,9,2,4,7,1,2]

print(max(numbers, key=numbers.count)) # 7
print(max(numbers, key=lambda x:numbers.count(x))) # 7