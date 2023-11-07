# @deep-grasp/react

React binding for `deep-grasp`, define graspable components, custom LLM context and mount them into your app.

## Setup grasp in app

Initially we need a one-time setup to integrate `deep-grasp` into your app, this is as simple as adding a context provider on the root of app.

```tsx
import {GraspProvider} from '@deep-grasp/react';

export function App() {
    return (
        <GraspProvider {/* props */}>
            {/* Existing app code */}
        </GraspProvider>
    );
}
```

We will describe in detail how `GraspProvider` requires some props to work properly.

### Invoke LLM

To connect `GraspProvider` with LLM, you need to provide a `service` prop, which is a custom function receiving certain request payload and returns a promise resovling to LLM response.

See [`@deep-grasp/core`](https://github.com/ecomfe/deep-grasp/tree/master/packages/core) for implementing `Service` function.

### Provide usable components

`GraspProvider` also requires a `components` prop, which includs a list of components that can be detected by LLM.

A component info includes 2 parts:

- A `definition` field defined in [`@deep-grasp/core`](https://github.com/ecomfe/deep-grasp/tree/master/packages/core).
- A `component` field refering to a React component so it can be rendered.

You can construct component info manually like:

```ts
[
    {
        definition: {
            name: 'home_city_weather',
            description: 'Query current weather in a city',
            props: {
                type: 'object',
                properties: {
                    city: {
                        type: 'string',
                        description: 'The city name to query',
                    },
                },
            },
        },
    },
];
```

Usually we don't do this because `deep-grasp` also provides a command line tool to detect components in source code and auto generate info.

### Inject system instructions

In case you want LLM to be aware of some knowledge of your app, like current user or the description of app, you can pass a string array to `system` prop.

All messages inside `system` prop will be formatted and send to LLM, please be sure you don't take up too many tokens.

## Define a graspable component

A **graspable component** is a component that `deep-grasp` can recognize and retrieve from user's natural language query.

To define a React component as a graspable, you need to wrap it with `graspable` HoC function.

```tsx
import {graspable} from '@deep-grasp/react';

interface Props {
    /** The city name to query */
    city: string;
}

function Weather({city}: Props) {
    // ...
}

export default graspable(Weather, 'Query current weather in a city');
```

As a basic example, add these to your existing code works:

1. Wrap your component with `graspable` and export (either named ot default) it.
2. Once a component has props, define props in a TypeScript interface, add jsdoc comment to each property.

### Customizing render when used by LLM

`graspable` is actually a "meta" HoC, it didn't change the visual or behavior of your component, it's major responsibility is to tell our code analyzer to collect infomation about this component, however it can have limited cusomization when component is rendered by LLM response.

When component is rendered by LLM, component will first go for a normal render resulting a `ReactElement`, this element will then be passed to `render` option of `graspable` so that you can add a container, a `Suspense` or anything surronding the element.

Here is an example to make `Weather` component render a mini version when used by LLM, and a wrapping `Suspense` allows it to render a loading indicator when data is not ready yet.

```tsx
export default graspable(
    Weather,
    'Query current weather in a city',
    {
        render: element => (
            <div className="city-weather-mini">
                <WeatherDisplayConfigProvider size="mini" filter="summaryOnly">
                    <Suspense fallback={<Spin />}>
                        {element}
                    </Suspense>
                </Weather>
            </div>
        ),
    }
);
```

## Mount grasped component

A mount point is where you want receive user query, invoke LLM and render a grasped component. `@deep-grasp/react` provides `GraspMount` component to do this.

You can put `GraspMount` anywhere any times inside a `GraspProvider` context, each will responds to your query and work with `service` prop of `GraspProvider`.

A `GraspMount` receives some props.

```ts
interface GraspMountProps {
    /** User's natural language input */
    query: string;
    /** Render when idle (without any user query) */
    renderIdle?: () => ReactElement;
    /** Render when invoking LLM */
    renderPendingOnModelCall?: (query: string) => ReactElement;
    /** Render if LLM fails to grasp any usable piece */
    renderModelMessage?: (message: string) => ReactElement;
    /** Render upon successful retrieval of a component */
    renderComponentResult?: (element: ReactElement) => ReactElement;
    /** Render on error from model or locating usable peice */
    renderError?: (message: string) => ReactElement;
}
```

Besides a required `query` prop, all other props define the visual result of `GraspMount` in different states. By default, `GraspMount` will render nothing when **idle**, **pending** and **error** or LLM fails to retrieve a usable piece, and will directly render the retrieved component on success.

```tsx
function renderIdle() {
    return <Empty description="Your loyal AI is ready to help" />;
}

function renderPending() {
    return <Spin description="AI is working hard to process your request" />;
}

function renderMessage(message: string) {
    return (
        <Result
            title="Sorry but we can't find a good solution for you, hope this may help you"
            subTitle={message}
        />
    );
}

function renderError(message: string) {
    return (
        <Result
            status="error"
            title="Woops there is something wrong"
            subTitle={message}
        />
    );
}

function renderComponent(element: ReactElement) {
    return (
        <div className="ai-spotlight">
            <Suspense fallback={<Spin />}>
                <ErrorBoundary>
                    {element}
                </ErrorBoundary>
            </Suspense>
        </div>
    );
}

<GraspMount
    // Get query from a input component
    query={query}
    renderIdle={renderIdle}
    renderPendingOnModelCall={renderPending}
    renderModelMessage={renderMessage}
    renderComponentResult={renderComponent}
    renderError={renderError}
/>;
```
