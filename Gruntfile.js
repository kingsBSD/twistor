module.exports = function(grunt) {
	grunt.loadNpmTasks("grunt-contrib-concat");
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-contrib-watch");
	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-babel");

	grunt.initConfig({
		concat: {
			options: {
				separator: ";\n"
			},
			target: {
				src: "web/src/*.js",
				dest: "web/static/script.js"
			}
		},
		babel: {
			options: {
				sourceMap: true
			},
			target: {
				files: {
					"web/static/script.js": "web/static/script.js"
				}
			}
		},
		uglify: {
			options: {
				sourceMap: true,
				inSourceMap: "web/static/script.js.map",
				screwIE8: true
			},
			target: {
				files: {
					"web/static/script.js": "web/static/script.js"
				}
			}
		},
		jshint: {
			options: {
				force: true,
				esnext: true,
				browser: true,
				globals: { _: true }
			},
			target: { src: "web/static/script.js" }
		},
		watch: {
			js: {
				files: ["web/src/*.js"],
				tasks: ["concat","jshint","babel","uglify"]
			}
		}
	});

	grunt.registerTask("default", ["watch"]);
};
