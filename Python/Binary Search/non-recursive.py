
pos = -1

def search(lst, n):
    left, right = 0, len(lst) - 1
    
    while left <= right:
        mid = (left + right) // 2

        if lst[mid] == n:
            globals()['pos'] = mid
            return True
        if lst[mid] < n:
            # Search Right
            left = mid
        else :
            # Search Left
            right = mid
    
    return False


lst = [4,7,8,12,45,99,102,702,,10987,56666]
n = 10987

if(search(lst, n)):
    print("Found at " , pos + 1)
else:
    print("Not found")
