# Go Notebook

- [Go Notebook](#go-notebook)
	- [Goroutines](#goroutines)
	- [Encoding/Decoding](#encodingdecoding)
	- [Interfaces and Structs](#interfaces-and-structs)
	- [Passing slices as arguments](#passing-slices-as-arguments)

## Goroutines

* send and receives are **blocking** operations; the channel that **sends** must have some **available receivers** and a **receiver** must have a receiver

[Playground](https://play.golang.org/p/kZ0VeSydC4D).

```go
// the sender must have available receivers
func write(ch chan int) {
	for i := 0; i < 5; i++ {
		fmt.Println("about to write", i)
		ch <- i
		fmt.Println("value written")
	}

	close(ch)
}

func main() {
	ch := make(chan int, 2)

	go write(ch)

	fmt.Println("AFTER GOROUTINE")

	time.Sleep(2 * time.Second)

	for v := range ch {
		fmt.Println("value received", v)
		time.Sleep(time.Second)
	}

	fmt.Println("END")
}

/* 
AFTER GOROUTINE
about to write 0
value written
about to write 1
value written
about to write 2
value received 0
value written
about to write 3
value received 1
value written
about to write 4
value received 2
value written
value received 3
value received 4
END
*/
```

```go
package main

import (
	"fmt"
	"io/ioutil"
	"net/http"
	"sync"
	"time"
)

const url = "https://jsonplaceholder.typicode.com/todos/"

func fetch(id int) (string, error) {
	time.Sleep(time.Second)

	resp, err := http.Get(fmt.Sprint(url, id))

	if err != nil {
		return "", err
	}

	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)

	if err != nil {
		return "", err
	}

	return string(body), nil
}

func main() {
	todoIds := [...]int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10}
	responses := []string{}
	var wg sync.WaitGroup
	sem := make(chan int, 4)

	wg.Add(len(todoIds))

	for _, id := range todoIds {
		go func(id int) {

			// if `sem` channel is full, then subsequent iterations will be blocked until it frees up some space(e.g <-sem)
			sem <- 1
			// fmt.Println("START WORK")
			defer wg.Done()

			resp, err := fetch(id)

			if err != nil {
				return
			}

			responses = append(responses, resp)

			// fmt.Println("RELEASE")
			<-sem
		}(id)
	}

	wg.Wait()

	fmt.Println("READY")
	// fmt.Println(responses)
}
```

---

## Encoding/Decoding

* https://medium.com/rungo/working-with-json-in-go-7e3a37c5a07b

```go
package main

import (
	"encoding/json"
	"fmt"
)

// when using a struct, non-exported fields will be ignored
type Person struct {
	Name string `json:"name"`
	Age  int    `json:"age,string"`
}

func main() {
	p := Person{
		Name: "andrei",
		Age:  19,
	}

	s, err := json.Marshal(p)

	if err != nil {
		return
	}

	fmt.Printf("%s \n", s) // {"name":"andrei","age":"19"}

	// When using maps, non-exported fields will **not** be ignored
	m := make(map[string]interface{})

	m["foo"] = Person{
		Name: "andrei",
		Age:  19,
	}

	s, err = json.Marshal(m)

	if err != nil {
		return
	}

	fmt.Printf("%s", s) // {"foo":{"name":"andrei","age":"19"}}
}
```

```go
data := []byte(`
	{
		"bar": "true"
	}
`)

// without defining the container type
var i interface{}

json.Unmarshal(data, &i)

// extract the concrete values
barData := i.(map[string]interface{})
fmt.Println(barData["bar"])
```

---

## Interfaces and Structs

```go
package main

import "fmt"

type Value interface {
	String() string
	Type() string
}

type StructB struct {
	names []string
}

// implementing the interface

func (s *StructB) String() string {
	return "toString"
}

func (s *StructB) Type() string {
	return "the type is string"
}

type StructA struct {
	name string
	StructB
}

func foo(value Value) string {
	return value.String() + value.Type()
}

func main() {
	fmt.Println("test")
	val := &StructA{
		name: "andrei",
		StructB: StructB{
			names: []string{"andrei", "foo"},
		},
	}

	foo(val)
}
```

[Go Playground](https://play.golang.org/p/Cr-D8rS0EhI)

```go
package main

import (
	"fmt"
)

// func (param Interface) && foo(&entityThatImplementsInterface)

type customInt int
func (c *customInt) Test () string { return "a custom string" }

type anotherCustomInt int
func (a anotherCustomInt) Test () string { return "another custom string" }

type Int interface {
 Test() string
}

func foo (p Int) {
 fmt.Println(p.Test())
}

func main() {
	fmt.Println("Hello, playground")
	
	p := customInt(19)
	foo(&p)
	
	a := anotherCustomInt(4)
	foo(a)
}
```

--

## Passing slices as arguments

[Go Playground](https://play.golang.org/p/hykJGry8xjy)

```go
func foo(s []int) {
	s[0] = 111111
	s = append(s, 100)
	s = append(s, 200)
	s[1] = 22222
}

func bar(s *[]int) {
	temp := *s

	temp = append(temp, 1, 2, 3)

	*s = temp
}

func beer(s []int) {
	s = s[1:4]
	s[0] = 11111
}

func main() {
	// 2: when cap is trumped & when not - without pointer
	// [111111 22222 3] 3 5
	// s := make([]int, 0, 5)
	// s = append(s, 1, 2, 3)
	// foo(s)

	// fmt.Println(cap(s)) after `s[1]=...` -> 6 - its cap has been doubled
	// [111111 2 3] 3 3
	// the s[1] hasn't been set because the array had been reallocated
	// s := make([]int, 0, 3)
	// s = append(s, 1, 2, 3)
	// foo(s)

	// 2: when using pointers
	// [1 2 3 1 2 3] 6 6
	// s := []int{1, 2, 3}
	// bar(&s)

	// [2 3] 2 4
	// cap(s) - the number of elements that are in the
	// underlying array starting at the first element
	// from the current slice
	// s1 := []int{1, 2, 3, 4, 5}
	// s := s1[1:3]

	// [1 11111 3] 3 5
	s := make([]int, 0, 5)
	s = append(s, 1, 2, 3)
	beer(s)

	fmt.Println(s, len(s), cap(s))
}

```