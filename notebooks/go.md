# Go Notebook

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