# Exploring Docker

* io
* bytes.Buffer
* sync.Once

os.Getenv("DOCKER_CONFIG")
os.Getenv("DOCKER_CERT_PATH")

https://docs.docker.com/engine/reference/commandline/checkpoint/ --> /home/anduser/go/src/github.com/docker/cli/cli/command/commands/commands.go


type Cmd {
  subCommands: Cmd[]
  flags: {}  
}


```
type stringValue string

func newStringValue(val string, p *string) *stringValue {
	*p = val
	return (*stringValue)(p)
}
```

docker plugins ;)

*r2 = *r

/image/build.go :
```
// dockerfileFromStdin returns true when the user specified that the Dockerfile
// should be read from stdin instead of a file
func (o buildOptions) dockerfileFromStdin() bool {
	return o.dockerfileName == "-"
}
```

* you refer to Dockerfiles by using an URL: urlutil.IsURL(specifiedContext):

## Research

* https://medium.com/better-programming/overview-of-server-side-http-apis-in-go-44f052737e4b
* linux what is a socket
* linux what is a file descriptor
* https://medium.com/rungo/everything-you-need-to-know-about-packages-in-go-b8bac62b74cc
* https://github.com/olivere/go-container-debugging
* https://hub.docker.com/_/golang
* https://medium.com/@kaperys/delve-into-docker-d6c92be2f823
* https://medium.com/better-programming/about-var-run-docker-sock-3bfd276e12fd
* docker ee vs ce :)
* go shallow clone
* what is /var/run/docker.sock
* what tis unix:///var/run/docker.sock
* yt: docker.sock / what are unix sockets\
* linux what is pid
* linux service
* linux  .conf files

## Learnings

* cli sends a compressed file to the daemon server