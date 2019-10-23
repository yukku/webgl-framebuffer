# WebGL Framebuffer

This is a simple example of creating WebGL from scratch. If you click on any part of screen, it should trigger a particle following the law of physics. On Macbook Pro 13 2017 spec (not very capable CPU/GPU), it can handle up to 10000+ particles without sacrificing too much of frame rate. 

It also updates the buffer dynamically if the particles goes out of screen for performance but with some trade-off..

###Install
```
npm install
```
###Start development server
```
npm start
```
Then go to <http://0.0.0.0:4000/> on your browser

###Run tests
```
npm test
```



# References

<https://webglfundamentals.org/webgl/lessons/webgl-fundamentals.html>
<https://thebookofshaders.com/07/>
<https://burakkanber.com/blog/modeling-physics-javascript-gravity-and-drag/>
<https://stackoverflow.com/questions/29982228/how-to-apply-gravity-to-bouncing-balls-in-javascript]>
<https://burakkanber.com/blog/modeling-physics-javascript-gravity-and-drag/>
