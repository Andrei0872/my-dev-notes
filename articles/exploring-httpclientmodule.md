* put breakpoint in your interceptor
* once in `client.ts` 
    * provide image with all well-known methods
    * explain `events$`(the `request()` method)
* once in `HttpInterceptingHandler.handle`
    * explain the `HTTP_INTERCEPTORS`token
    * explain the `HttpBackend`
        * where the request is fired
    * put a breakpoint inside the `reduceRight`'s cb function to understand how the interceptor chain is built(line 40) + refresh
        * rebuild the mechanism
        * explain `HttpInterceptorHandler`
            * just provide the image
    * put a breakpoint on line 42


## TODO
* delay interceptor
* retry interceptor
* re-subscribe to interceptor(`next.handle(req)`)

# Exploring the HttpClientModule in Angular

In this post, we are going to understand how the `HttpClientModule` actually works behind the scenes and find answers to some questions that might have arisen while using this module.

_Note: This article is based on **Angular 8.2.x**_.

## Setting up

My favorite way to understand how things really work is by using the debugger while having the source code in my text editor so that I can explore and make assumptions easily.

### Installing Angular on your machine

```bash
git clone -b 8.2.x --single-branch https://github.com/angular/angular.git
```

### StackBlitz

You can find a StackBlitz demo [here](https://stackblitz.com/edit/ng-understanding-http).

We are going to use it throughout the article in order to get a better understanding of how entities are connecting with each other.

---

## What is HttpClientModule?

The `HttpClientModule` is a **service module** provided by Angular that allows us to perform **HTTP requests** and easily manipulate those requests and their responses. It is called a **service module** because it **only instantiates services** and **does not export** any components, directives or pipes.

---

## Let's start exploring 🚧

Once in the StackBlitz project:

* open the dev tools

* head over to `token.interceptor.ts`(CTRL + P) and put a breakpoint on `line 9`

* refresh the _StackBlitz browser_

Now, you should see something like this:

<img src="../screenshots/articles/exploring-httpclientmodule/img1.png" style="text-align: center;">

By clicking on the _anonymous function_ from `clint.ts`, you are now in the `HttpClient` class, which is the one you usually inject in your services.

As you might have expected, this class comprises the methods for the well-known HTTP verbs.

<img src="../screenshots/articles/exploring-httpclientmodule/httpclient.png" style="text-align: center;">

I'd kindly recommend switching over to your text editor and start exploring this `HttpClient.request` method a little.


Continuing on, put a breakpoint on the `line 492` and refresh the browser. The most interesting part is just about to begin!

<img src="../screenshots/articles/exploring-httpclientmodule/httpevents.png" style="text-align: center;">

At this point, we can't step into `this.handler.handle()` because the observable is just being built and has no subscribers yet. So, we must manually set a breakpoint inside the `handle` method.

To do so, switch over to your text editor and scroll up to the `constructor`.
The `HttpHandler` is a **DI token** that maps to `HttpInterceptingHandler`. 

Here's a list of all providers: 

<img src="../screenshots/articles/exploring-httpclientmodule/img2.png" style="text-align: center;">

What's left to do is to go into `HttpInterceptingHandler` class and set a breakpoint inside the `handle` method.

After successufully identifying its location, switch back to your dev tools, add your breakpoint and resume the execution!

<div style="text-align: center;"><img src="../screenshots/articles/exploring-httpclientmodule/httpintercepting.png"></div>

_`BarInterceptor` is provided in `app.module`_

Here we are able to grab all the interceptors by injecting the  `HTTP_INTERCEPTOR`(a **multi-provider token**) inside our method.

The next step consists of creating the **injectors chain**.  
But first, let's have a quick look at `HttpInterceptorHandler`:

<img src="../screenshots/articles/exploring-httpclientmodule/httpinterceptor.png" style="text-align: center;">

I like to think of this **chain** as a **linked list** that is built starting off from the **tail node**.

In order to get a better overview of this, I'd suggest that you keep resuming the execution until you reach `line 42`, while paying attention to what's going on in the `Scope` tab.

Now, we can go through the list starting off from the `head node` by stepping into the `handle` function from `line 42`. 

Here's how this linked list could look like:

<div style="text-align: center;">
    <img src="../screenshots/articles/exploring-httpclientmodule/httpinterceptors.jpg">
</div>

* HttpBackend
    * here the request is dispatched
    * how can a request be `aborted` ?(show `switchMap` example)
    * returns the response as a **cold observable** 


Judging by the image above, we can tell that every `next.handle()` **returns** an **observable**.
What this means is that every interceptor can add custom behavior to the returned observable. Those **changes** will **propagate** in the **previous interceptors**.

* show retry behavior
    * retry operator
    * resubscribe(after refresh token is received)
