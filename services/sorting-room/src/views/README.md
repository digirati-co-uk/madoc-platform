# Writing views 
Views provide the semantics, content and structure for our pages.

## Approach
The views are written in [handlebars](http://www.google.com) and at the top level are divided into **layouts** and **pages**.

A build process will convert the **.hbs** views into static templates at build-time.

### Layouts

Layouts are the main structure of a template, they may include references to assets and document structure.

### Pages

Pages contain content and modules and when combined with a layout, form a complete page.


## Atomic design

For smaller projects, layouts and pages may provide a sufficient level of granularity. However, larger more sophisticated projects are better handled using a structured build system.

###Atoms

Atoms are our HTML tags, such as a form label, an input or a button.

Atoms can also include more abstract elements like colour palettes, fonts and even more invisible aspects of an interface like animations.

Like atoms in nature they’re fairly abstract and often not terribly useful on their own. However, they’re good as a reference in the context of a pattern library as you can see all your global styles laid out at a glance.

###Molecules

Molecules are groups of atoms bonded together and are the smallest fundamental units of a compound. These molecules take on their own properties and serve as the backbone of our design systems.

For example, a form label, input or button aren’t too useful by themselves, but combine them together as a form and now they can actually do something together.

Building up to molecules from atoms encourages a “do one thing and do it well” mentality. While molecules can be complex, as a rule of thumb they are relatively simple combinations of atoms built for reuse.

###Organisms

Molecules give us some building blocks to work with, and we can now combine them together to form organisms. Organisms are groups of molecules joined together to form a relatively complex, distinct section of an interface.

Organisms can consist of similar and/or different molecule types. For example, a masthead organism might consist of diverse components like a logo, primary navigation, search form, and list of social media channels. But a “product grid” organism might consist of the same molecule (possibly containing a product image, product title and price) repeated over and over again.

Building up from molecules to organisms encourages creating standalone, portable, reusable components.
