# Module: mmm-nest-status

The `mmm-nest-status` module is a [MagicMirror](https://github.com/MichMich/MagicMirror) addon.

This module displays both your [Nest](https://www.nest.com) thermostats and protect smoke detectors on your Magic Mirror and supports multiple modes to get you exactly the views that you want.

![image](https://user-images.githubusercontent.com/3209660/49417517-acdf8780-f743-11e8-8ae9-07da9f24b39e.png)
*An example showing multiple thermostats and multiple smoke detectors (using the small & dark Protect design):*

## Key Features
- all design states for the Nest thermostat, including Eco mode and leaf/fan icons
- all design states for the Nest protect plus `dark` and `small` variations to better fit into your mirror theme
- choose between `visual` and `list` mode to display your devices
- choose to display all your thermostats/protects, or pick & choose which devices to show
- choose to display the name of the thermostat/protect for easy identification
- group the thermostats and protects together, or split them up into stackable containers

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

## General Configuration Options

| Key | What it Does | Values | Default | Notes |
|---|---|---|---|---|
| `token` | Your Nest API token. | -- | -- | **This value is required for this module to work.** |
| `displayType` | Choose between a visual view or a list view. | `visual`, `list`, `list-id` | `visual` | `list-id` is the same as `list`, but shows device IDs in the list as well. |
| `displayMode` | Which devices to display. | `thermostat`, `protect`, `all` | `all` | -- |
| `thermostatsToShow` | Which thermostats to display. | `all`, `first`, `[]` | `all` | Accepts an `array` of device IDs - you can get the IDs from setting the `displayType` to `list-id`. |
| `protectsToShow` | Which protects to display. | `all`, `first`, `[]` | `all` | Accepts an `array` of device IDs - you can get the IDs from setting the `displayType` to `list-id`. |
| `units` | Which temperature units to use. | `imperial` (fahrenheit), `metric` (celsius) | Specified by MM's `config.js` | If, for some reason, you wish to override your `config.js` settings for `units`, this is where you do it. |
| `updateInterval` | How often to update the Nest data. | value in `ms` | `60000ms` (aka 1 minute) | Nest recommends updating no more than once pr. minute. |

## Configuration Options specific to the Visual view

**The following options only apply if your `displayType` has been set to `visual` - they have no effect on the list view:**

| Key | What it Does | Values | Default | Notes |
|---|---|---|---|---|
| `showNames` | Whether to show the device name or not. | `true`, `false` | `true` | Displays the device name above the device. |
| `alignment` | How the elements should be aligned on screen. | `left`, `center`, `right` | `left` | If you have a lot of devices, the `center` mode looks nicer. |
| `groupTogether` | Whether all devices should be in a single box. | `true`, `false` | `true` | If this is set to `false`, thermostats will be in one box and protects will be in another box underneath. |
| `protectSize` | Size of the Protect smoke detector. | `small`, `regular` | `regular` | If you have a lot of protects, use the `small` size. |
| `protectDarkMode` | Switches protects to use the dark design. | `true`, `false` | `false` | Dark mode for the protects. Works great with the `small` mode above. |
| `protectShowOk` | Toggles the `ok` text in a green protect. | `true`, `false` | `true` | If everything is ok with the protect, this shows the text `ok`. |

## How It Looks

### Visual view: Thermostat

![image](https://user-images.githubusercontent.com/3209660/49419333-f7fd9880-f74b-11e8-9e16-23aa80f6aa2d.png)

### Visual view: Multiple Thermostats

![image](https://user-images.githubusercontent.com/3209660/49419463-870ab080-f74c-11e8-8498-56a9f4f32e26.png)

### Visual view: Protect

![image](https://user-images.githubusercontent.com/3209660/49419889-82df9280-f74e-11e8-98e4-1aad5c080076.png)

By default the protects are the same dimensions as the thermostats - which means they line up nicely next to each other.

![image](https://user-images.githubusercontent.com/3209660/49419962-d0f49600-f74e-11e8-8292-557a1249fc21.png)

### Visual view: Protect (Dark Mode)

![image](https://user-images.githubusercontent.com/3209660/49420474-3e092b00-f751-11e8-9317-76aea978fafc.png)

Lined up with thermostats:

![image](https://user-images.githubusercontent.com/3209660/49420527-7f99d600-f751-11e8-942b-97cf7dfa6d7f.png)

### Visual view: Protect (Small Mode)

The states are the same as the default (large) size of the protect - these are just smaller, so you can display more devices without filling up your entire mirror. Please note that if you're using the small version of the protects, the protects automatically sit in a box by themselves beneath any thermostats you might have.

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

This allows you to pick and choose which devices you want to display.

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

### When I set `protectSize` to `small`, my protects are now displayed underneath my thermostats instead of next to the thermostats. Why?

It looks better this way - trust me.

### I have a humidifier hooked up to my thermostat and on the Nest app, I can see a humidifying icon when it is running. Do you show this too?

No, unfortunately not - there's currently no way to get this information from the Nest API. It only tells me that a fan is running, but doesn't distinguish between a fan and a humidifier.

### When I run this module, the fonts look different than your screenshots. Why is that?

Nest uses their own, proprietary font named `Akkurat` for all their devices. Seeing that this font isn't open source, I'm not able to include it with this module - if you want to use it, purchase a license and follow the instructions in the `mmm-nest-status.css` file to install.

If you don't own this font, this module will just fall back to using the standard `Roboto` font - don't worry, it still looks great.

### Does this module support touch or mouse interactions? Eg. can I change the temperature of my thermostat using this?

No, right now this module only displays information - it does not allow you to control your Nest devices.