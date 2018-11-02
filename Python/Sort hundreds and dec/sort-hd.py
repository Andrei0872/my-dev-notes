
# https://stackoverflow.com/questions/53016461/sorting-a-list-by-hundreds-ones

#* Sorting a list by hundreds/ones

lst = [103, 302, 405, 204, 301, 105, 202, 303, 201, 404]

# Sorting asc by the reversed number
lst2 = sorted(lst, key=lambda x: str(x)[::-1])
print(lst2) # [201, 301, 202, 302, 103, 303, 204, 404, 105, 405]

# Sorting asc using a sort key of the ones digit, then the hundreds
lst3 = sorted(lst, key =lambda x : ((x % 10), (x / 100 % 10)))
print(lst3) # [201, 301, 202, 302, 103, 303, 204, 404, 105, 405]


# https://docs.scipy.org/doc/numpy-1.15.1/reference/generated/numpy.lexsort.html
import numpy as np
lst4 = np.array([103, 302, 405, 204, 301, 105, 202, 303, 201, 404])
# Sort by ones, then by hundreds
res = lst4[np.lexsort((lst4 // 100, lst4 % 10))]
print(res) # [201 301 202 302 103 303 204 404 105 405]

ind = np.lexsort((lst4 // 100, lst4 % 10))
# Returned value : the indices
print(ind) # [8 4 6 1 0 7 3 9 5 2]
