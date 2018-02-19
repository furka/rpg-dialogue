# rpg-dialogue

### Install

```sh
$ npm install --save-dev rpg-dialogue
```

### Description
An es6 class for handling dialogue trees, useful for RPG games.

### Features
* Simple interface: `dialogue.interact(id);`
* Dialogue tree defined in HTML
* Conditional branches
* Branch actions

## Usage
Code:

```js
import RPGDialogue from 'rpg-dialogue';
import template from 'demo.pug';

let dialogue = new RPGDialogue(template());
dialogue.interact(id);                     //interact with a specific dialogue branch
```
Dialogue tree:

```pug
d#0 Hello world
  d(next=1) A good day to you too, sir and/or madam!
  d(next=2) Bye.

d#1 Thanks!
  d(next=2)

d#2 Bye
```


## API

Instantiate a new dialogue with a template dialogue tree

```js
let dialogue = new RPGDialogue(template);
```

### `.interact(id, [conditions, actions])`

Interact with the dialogue tree

```js
let response = dialogue.interact(0);

```

This will return a `JSON` object containing a response text and subsequent dialogue options

```json
{
  "text": "Hello world",
  "responses": [
    {
      "id": 1,
      "text": "A good day to you too, sir!"
    },
    {
      "id": 2,
      "text": "Bye."
    }
  ]
}
```

You would then have the option to continue with `dialogue.interact(1)` or `dialogue.interact(2)`.

## Templates
Templates are entirely defined as HTML.

To make life easier it is recommended to combine this with your favourite templating language. For the purpose of this documentation we will use [Pug](https://pugjs.org/) but you are free to pick whichever one you prefer, even native html.

```pug
d#0 Hello world
  d(next=1) A good day to you too, sir!
  d(next=2) Bye.

d#1 Thanks!
  d(next=2)

d#2 Bye
```

```js
import helloWorld from 'hello-world.pug';
import RPGDialogue from 'rpg-dialogue';

let dialogue = new RPGDialogue(helloWorld());
dialogue.interact(0);
```

### ID

Use an ID to define a point in your dialogue that can be interacted with.

```pug
d#0 Hello world
```

### Next

Use the `next` attribute to have dialogue options lead to a different point within the dialogue.

```pug
d#0 Hello world
  d(next=1) Thanks

d#1 Bye!
```

### Linear text

ID's can be omitted for non-branching dialogue trees

```pug
d#0 Stay a while and listen
  d I have an amazing story to tell you
   d But time is running short
    d(next=1) Ok...

d#1 Bye!
```

### Conditions

Conditions can be defined to control which branches can be accessed by the dialogue.
This lets your application have control over when a specific dialogue option is available or not.
Conditions can be negated with `!`.

```pug
d#0 Are you alive?
  d(next=1, if='IS_ALIVE') Yes!
  d(next=1, if='!IS_ALIVE') Nope!
  d(next=2) Maybe...

d#1 Cool!
d#2 Hmmmm...
```
Then, in your code:

```js
const CONDITIONS = {
  IS_ALIVE: () => player.hp > 0,
  IS_PLAYER: true
}

let response = dialogue.interact(0, CONDITIONS);
```

The conditions must map to a _truthy_ value or a function that returns a _truthy_ value


### Actions

Actions can be defined to trigger when a certain branch is reached in the dialogue. This lets the dialogue trigger functions within your application.

```pug
d#0 Do you feel lucky? Punk.
  d(next=1) Yes!
  d(next=2) Nope...

d#1 Okay then.

d#2(then='KILL_PLAYER') Wrong answer!
```


```js
const ACTIONS = {
  KILL_PLAYER: () => player.kill()
}

let response = dialogue.interact(0, null, ACTIONS);
```

Any action that is not a valid function will be ignored