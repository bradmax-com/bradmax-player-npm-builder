#! /usr/bin/env node

'use strict';

const {
	spawn
} = require('child_process');
const _gulp = require('gulp');
const _concat = require('gulp-concat');
const _uglify = require('gulp-uglify');
const _rename = require('gulp-rename');
const _plumber = require('gulp-plumber');

async function task(taskLabel, sources, dest) {
	return new Promise(async (resolve, reject) => {
		_gulp.src(sources)
			.pipe(_plumber())
			.pipe(_concat('index.js'))
			.pipe(_gulp.dest(dest))
			// .pipe(_uglify())
			// .pipe(_rename('index.min.js'))
			// .pipe(_gulp.dest(dest))
			.on('error', reject)
			.on('end', resolve);
	});
}
exports.task = task;
