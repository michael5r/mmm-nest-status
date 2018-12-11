# Module: mmm-nest-status

The `mmm-nest-status` module is a [MagicMirror](https://github.com/MichMich/MagicMirror) addon.

This module displays both your [Nest](https://www.nest.com) thermostats and protect smoke detectors on your Magic Mirror and supports multiple modes to get you exactly the views that you want.

![image](https://user-images.githubusercontent.com/3209660/49621016-097fb400-f989-11e8-9fb2-bb824ac41203.png)
*An example showing multiple thermostats and multiple smoke detectors (using the large size & classic mode for the thermostats, and the small size & dark mode for the protects):*

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
`token`              | `int`            | -         | **This value is required for this module to work.**
`displayType`        | `string`         | `grid`    | One of: `grid`, `list`, [`list-id`](#list-view-with-id-thermostat--protect)
`displayMode`        | `string`         | `all`     | One of: `thermostat`, `protect`, `all`
`thermostatsToShow`  | `string`,`array` | `all`     | One of: `all`, `first`, or an `array` with [device IDs](#list-view-with-id-thermostat--protect)
`protectsToShow`     | `string`,`array` | `all`     | One of: `all`, `first`, or an `array` with [device IDs](#list-view-with-id-thermostat--protect)
`units`              | `string`         | config.js | One of: `imperial` (fahrenheit), `metric` (celsius)
`updateInterval`     | `int`            | `120000`  | Default is 2 minutes - Nest recommends updating no more than once pr. minute.
`initialLoadDelay`   | `int`            | `0`       | How long to delay the initial load (in ms)

**Note:** `units` get their default value from the MagicMirror `config.js` file. I'd strongly suggest adding the value in there instead of adding it in this module.


## Configuration Options specific to the Grid view

The following options only apply if your `displayType` has been set to `grid` - they have no effect on the list view:

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

#### Large Size

With `showNames` set to `false`.

![image](https://user-images.githubusercontent.com/3209660/49625264-7b142e00-f99a-11e8-815e-05f6e92d9808.png)

#### Medium Size

![image](https://user-images.githubusercontent.com/3209660/49628282-dfd68500-f9a8-11e8-804f-8761070285d9.png)

#### Small Size

![image](https://user-images.githubusercontent.com/3209660/49628314-18765e80-f9a9-11e8-9f59-afe82964d7e7.png)

### Grid view: Thermostat (Non-Classic Mode)

The non-classic view is a bit more abstract and doesn't include quite as detailed information as the `classic` mode.

#### Large Size

With `showNames` set to `false`.

![image](https://user-images.githubusercontent.com/3209660/49628758-b8cd8280-f9ab-11e8-96a5-1278311ad5d8.png)

#### Medium Size

![image](https://user-images.githubusercontent.com/3209660/49628974-c1728880-f9ac-11e8-9727-d37ab032f713.png)

#### Small Size

![image](https://user-images.githubusercontent.com/3209660/49628480-e9142180-f9a9-11e8-83d5-9d7a1cb6585e.png)

### Grid view: Protect

I'm not showing screenshots of the large size, but just imagine they're the same as the `medium` size below just ... well ... larger.

#### Medium Size

![image](https://user-images.githubusercontent.com/3209660/49628193-5aeb6b80-f9a8-11e8-8974-fae75973e25d.png)

Thermostats and protects with the same size parameter line up nicely next to each other if `groupTogether` is set to `true`.

![image](https://user-images.githubusercontent.com/3209660/49628019-83bf3100-f9a7-11e8-8bce-9d34dcb1e8fe.png)

#### Small Size

![image](https://user-images.githubusercontent.com/3209660/49626681-a863da80-f9a0-11e8-9795-27518bcb83b2.png)


### Grid view: Protect (Dark Mode)

#### Medium Size

![image](https://user-images.githubusercontent.com/3209660/49628212-82dacf00-f9a8-11e8-80e9-8fb472ef6ae0.png)

Lined up with thermostats that have `thermostatClassic` set to `false`:

![image](https://user-images.githubusercontent.com/3209660/49628674-30e77880-f9ab-11e8-802a-c7f0460982ac.png)

#### Small Size

![image](https://user-images.githubusercontent.com/3209660/49626750-d6e1b580-f9a0-11e8-9927-40f260883ef5.png)

### List view: Thermostat & Protect

If you prefer just looking at text, set the `displayType` to `list`:

![image](https://user-images.githubusercontent.com/3209660/49421197-7a8a5600-f754-11e8-9b07-02a1e9f6e6f7.png)

All states show up in the list view as well:

![image](https://user-images.githubusercontent.com/3209660/49421535-fe910d80-f755-11e8-8493-b17a398be953.png)

### List view with ID: Thermostat & Protect

If the `displayType` is set to `list-id`, you get the list view but with IDs in front of every device:

![image](https://user-images.githubusercontent.com/3209660/49421591-30a26f80-f756-11e8-8390-14cd520fca7c.png)

You can use these IDs to specify which devices to show in `thermostatsToShow` and `protectsToShow`.

### Minimal View

For a very minimal & clean look, set `thermostatClassic` to `false`, `showNames` to `false` and `protectDark` to `true`.

![image](https://user-images.githubusercontent.com/3209660/49628601-b61e5d80-f9aa-11e8-8c26-1d810918f8a0.png)


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

### I'm getting a "Nest API rate limit has been exceeded"-error - what does it mean?

Nest applies data rate limits for accessing their API - if you get this error, it means your account has reached that limit and is now **temporarily** blocked from getting Nest API data. When this happens, the module will automatically try to load data again after **10 minutes**.

There is, unfortunately, nothing you can do about this - you simply have to wait for their block to expire.

You can [read more here](https://developers.nest.com/guides/api/data-rate-limits).

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