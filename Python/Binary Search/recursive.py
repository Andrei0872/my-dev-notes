
pos = -1

def search(lst,n,left,right):
    if left > right:
        return False
    
    mid = (left + right) // 2
    
    if lst[mid] == n:
        globals()['pos'] = mid
        return True

    return search(lst,n,mid + 1, right) if lst[mid] < n else search(lst,n,left,mid -1)


lst = [4,7,8,12,45,99,102,702,10987,56666]
n = 10987

if(search(lst, n,0,len(lst) - 1)):
    print("Found at " , pos + 1)
else:
    print("Not found")
