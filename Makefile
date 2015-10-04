PATH := node_modules/.bin:$(PATH)
SHELL := /bin/bash

js_src := web/src/*.js
js_dest := web/build/script.js

.PHONY: all clean

all: $(js_dest)

# TODO uglify doesn't accept sourcemaps from stdin
# change uglify rather than write to disk imo
# also note the sed is unsafe if you don't just use strict everywhere (I do tho)
$(js_dest): $(js_src)
	mkdir -p $(dir $@)
	sed -e '1b;/^"use strict";$$/d' $(js_src) | babel | uglifyjs -cm > $@

# TODO lol I say that a lot don't I
# test: $(js_src)
#	eslint $(js_src)

clean:
	rm -rf web/build
