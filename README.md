# Deep Grasp

The goal of this project is to seamlessly integrate LLM into your current app. This means that users can retrieve and interact with a specific part of the user interface using natural language, without any intrusive measures.

> [!NOTE]
> This repo is still under heavy development, we welcome any idea and feedback.

## What is it

In the age of AI, we see increasing trend to adopt LLM into web applications, but for a large real world app, it is usually not easy to integrate AI feature into thousands lines of code.

Deep Grasp, aimed to non-intrusive integration to LLM, is able to do more by less code, as an example, we simply change a little code like:

```diff
+import {graspable} from '@deep-grasp/react';
+
-export default function Clock({timezone}: Props) {
+function Clock({timezone}: Props) {
     // ...
 }
+export default graspable(Clock, 'View clock in specified timezone');
```

As a result, we can get smooth and easy to use LLM features, a decorated component can be created and rendered automatically from user's natural language query.

https://github.com/ecomfe/deep-grasp/assets/639549/32fe1dfb-400c-40ea-b890-369500d91c0b
