# Module: mmm-nest-status

The `mmm-nest-status` module is a [MagicMirror](https://github.com/MichMich/MagicMirror) addon.

This module displays both your [Nest](https://www.nest.com) thermostats and protect smoke detectors on your Magic Mirror and supports multiple modes to get you exactly the views that you want.

![image](https://user-images.githubusercontent.com/3209660/49417517-acdf8780-f743-11e8-8ae9-07da9f24b39e.png)
*An example showing multiple thermostats and multiple smoke detectors (using the small & dark Protect design):*

## Key Features
- all states for the Nest thermostat (including Eco mode, Away mode, leaf/fan icons, etc) in 2 different designs and 3 sizes
- all states for the Nest protect in 2 different designs and 3 sizes
- 2 different modes - `grid` and `list` - allows you to easily customize your display
- choose to display all of your thermostats/protects, or pick & choose which devices to show
- choose to display the name of the thermostat/protect for easy identification
- group the thermostats and protects together, or split them up into stackable containers
- only re-renders the devices when data has actually changed

## Installing the module
Run `git clone https://github.com/michael5r/mmm-nest-status.git` from inside your `MagicMirror/modules` folder.

## Getting the Nest Token
Run `getToken.sh` in your terminal. This will walk you through setting up a [Nest Developer Account](https://developers.nest.com) (which is free) and will get you the token you need to allow this module access to the data from your Nest products.

## Using the module
To use this module, simply add it to the `modules` array in the MagicMirror `config/config.js` file:

```js
{
    module: 'mmm-nest-status',
    position: 'lower_third', // pick whichever position you want
    config: {
        token: YOUR_NEST_API_TOKEN,
        displayMode: 'all',
        displayType: 'all',
        thermostatsToShow: 'all',
        // ... and whatever else configuration options you want to use
    }
},
```

This module uses the excellent [Handlebars](http://handlebarsjs.com) library to serve up precompiled templates for the various designs. If you're just using this module **as is**, you don't need to do anything - this module already comes with all the templates you need.

If, however, you wish to modify the HTML structure of the thermostats or smoke detectors, read the [Using Handlebars](#using-handlebars) guide at the bottom of this page.

## General Configuration Options

Option               | Type             | Default   | Description
---------------------|------------------|-----------|-------------------------------------------------------
`token`              | `int`            | --------- | **This value is required for this module to work.**
`displayType`        | `string`         | `grid`    | One of: `grid`, `list`, [`list-id`](#list-view-with-id:-thermostat-&-protect)
`displayMode`        | `string`         | `all`     | One of: `thermostat`, `protect`, `all`
`thermostatsToShow`  | `string`,`array` | `all`     | One of: `all`, `first`, or an `array` with [device IDs](#list-view-with-id-thermostat-&-protect)
`protectsToShow`     | `string`,`array` | `all`     | One of: `all`, `first`, or an `array` with [device IDs](#list-view-with-id-thermostat-&-protect)
`units`              | `string`         | config.js | One of: `imperial` (fahrenheit), `metric` (celsius)
`updateInterval`     | `int`            | '60000'   | Nest recommends updating no more than once pr. minute.


## Configuration Options specific to the Grid view

**The following options only apply if your `displayType` has been set to `grid` - they have no effect on the list view:**

Option               | Type             | Default   | Description
---------------------|------------------|-----------|-------------------------------------------------------
`showNames`          | `boolean`        | `true`    | Displays the device name above the device
`alignment`          | `string`         | `center`  | One of: `left`, `center`, `right`
`groupTogether`      | `boolean`        | `false`   | Whether thermostats and protects share the same box
`thermostatSize`     | `string`         | `large`   | One of: `small`, `medium`, `large`
`thermostatClassic`  | `boolean`        | `true`    | [Classic view](#grid-view-thermostat-classic-mode) of the thermostat
`protectSize`        | `string`         | 'small'   | One of: `small`, `medium`, `large`
`protectDark`        | `boolean`        | 'false'   | Switches protects to use the [dark design](#grid-view-protect-dark-mode)
`protectShowOk`      | `boolean`        | 'true'    | Shows the text `ok` in a protect when everything is ok.


## How It Looks

### Grid view: Thermostat (Classic Mode)

![image](https://user-images.githubusercontent.com/3209660/49419333-f7fd9880-f74b-11e8-9e16-23aa80f6aa2d.png)

### Grid view: Multiple Thermostats

![image](https://user-images.githubusercontent.com/3209660/49419463-870ab080-f74c-11e8-8498-56a9f4f32e26.png)

### Grid view: Protect

![image](https://user-images.githubusercontent.com/3209660/49419889-82df9280-f74e-11e8-98e4-1aad5c080076.png)

By default the protects are the same dimensions as the thermostats - which means they line up nicely next to each other.

![image](https://user-images.githubusercontent.com/3209660/49419962-d0f49600-f74e-11e8-8292-557a1249fc21.png)

### Grid view: Protect (Dark Mode)

![image](https://user-images.githubusercontent.com/3209660/49420474-3e092b00-f751-11e8-9317-76aea978fafc.png)

Lined up with thermostats:

![image](https://user-images.githubusercontent.com/3209660/49420527-7f99d600-f751-11e8-942b-97cf7dfa6d7f.png)

### Grid view: Protect (Small Mode)

The states are the same as the default (medium) size of the protect - these are just smaller, so you can display more devices without filling up your entire mirror.

**Regular mode:**

![image](https://user-images.githubusercontent.com/3209660/49420740-89700900-f752-11e8-9b11-ebd11dbd41db.png)

**Dark mode:**

![image](https://user-images.githubusercontent.com/3209660/49420747-9260da80-f752-11e8-9b32-b8ffc7c32320.png)

**Dark mode with both `showNames` and `protectShowOk` set to false:**

![image](https://user-images.githubusercontent.com/3209660/49420859-131fd680-f753-11e8-8299-ac256d237c22.png)

### List view: Thermostat & Protect

If you prefer just looking at text, set the `displayType` to `list`:

![image](https://user-images.githubusercontent.com/3209660/49421197-7a8a5600-f754-11e8-9b07-02a1e9f6e6f7.png)

All states show up in the list view as well:

![image](https://user-images.githubusercontent.com/3209660/49421535-fe910d80-f755-11e8-8493-b17a398be953.png)

### List view with ID: Thermostat & Protect

If the `displayType` is set to `list-id`, you get the list view but with IDs in front of every device:

![image](https://user-images.githubusercontent.com/3209660/49421591-30a26f80-f756-11e8-8390-14cd520fca7c.png)

You can use these IDs to specify which devices to show in `thermostatsToShow` and `protectsToShow`.

## FAQ

### How do I use `thermostatsToShow` and `protectsToShow`?

It's simple - both of these configurations take the following values:
- `all`: This is the default, it means that all thermostats or all protects will be displayed.
- `first`: Setting this value means that only the first thermostat and the first protect in the list will be displayed.
- `array`: Each device has an ID (which can be seen by setting `displayType` to `list-id`), so by adding these IDs to an array, you can select exactly which devices you want to display.

In `config.js`:
```js
protectsToShow: [0,1,2,3,8],
```

This results in only the 5 protects above being displayed.

### I have a humidifier hooked up to my thermostat and on the Nest app, I can see a humidifying icon when it is running. Do you show this too?

No, unfortunately not - there's currently no way to get this information from the Nest API. It only tells me that a fan is running, but doesn't distinguish between a fan and a humidifier.

### When I run this module, the fonts look different than your screenshots. Why is that?

Nest uses their own, proprietary font named `Akkurat` for all their devices. Seeing that this font isn't open source, I'm not able to include it with this module - if you want to use it, purchase a license and follow the instructions in the `mmm-nest-status.css` file to install.

If you don't own this font, this module will just fall back to using the standard `Roboto` font - don't worry, it still looks great.

### Does this module support touch or mouse interactions? Eg. can I change the temperature of my thermostat using this?

No, right now this module only displays information - it does not allow you to control your Nest devices.

## Using Handlebars

The Handlebars templates can all be found in the `templates` folder in the root of this module.

Before you do anything, if you don't have Handlebars installed, install it globally on your system:

```js
npm install handlebars -g
```

Make any changes you wish in the relevant `.hbs` files in the `templates` folder.

Once you're done, precompile all templates by running this in your terminal:
```js
handlebars <path-to-MM-modules>/mmm-nest-status/templates/*.hbs -f <path-to-MM-modules>/mmm-nest-status/mmm-nest-status-templates.js -m
```

Make sure you replace `<path-to-MM-modules>` with the correct file path to your Magic Mirror `modules` folder.

If you have any problems, check out the [Handlebars](http://handlebarsjs.com/precompilation.html) documentation (or open an issue in this repo).