PATH := node_modules/.bin:$(PATH)
SHELL := /bin/bash

js_src := web/src/*.js
js_dest := web/build/script.js

pretty_datetime = date +%d\ %b\ %H:%M:%S

.PHONY: all clean

all: $(js_dest)
	@true

$(js_dest): $(js_src)
	@mkdir -p $(@D)
	@sed -e '1b;/^"use strict";$$/d' $(js_src) | babel | uglifyjs -cm > $@
	@printf "($(shell $(pretty_datetime))) made $(@F)\n"

clean:
	@rm -rf web/build/
	@printf "($(shell $(pretty_datetime))) unmade web/build/\n"
