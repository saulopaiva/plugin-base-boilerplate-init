#!/usr/bin/env node
const prompt = require('prompt')
const rimraf = require("rimraf")
const ghdownload = require('github-download')
const replaceInFile = require('replace-in-file')
const uppercamelcase = require('uppercamelcase')

const dist = 'dist'

const properties = [
  {
    name: 'project',
    validator: /^[a-zA-Z\s\-]+$/,
    warning: 'Project name must be only letters, spaces, or dashes',
    description: 'Plugin name',
    required: true,
  },
  {
    name: 'description',
    validator: /^[a-zA-Z\s\-]+$/,
    warning: 'Project name must be only letters, spaces, or dashes',
    description: 'Plugin description',
    required: true,
  },
  {
    name: 'author',
    validator: /^[a-zA-Z\s\-]+$/,
    warning: 'Author name must be only letters, spaces, or dashes',
    required: true,
  },
]

prompt.start()

prompt.get(properties, async function (err, result) {
  if (err) { return onErr(err) }
  console.log('Creating plugin')
  
  await deleteDist()
  await download()
  await replaceNames(result)

  console.log('Done!')
  console.log('Check dist folder')
})

const onErr = function(err) {
  console.log(err)
  return 1
}

const replaceNames = async (params) => {
  const projectDefault = params.project
  const projectCamelCase = uppercamelcase(projectDefault)
  const projectDashCase = projectDefault.toLowerCase().replace(/\s/g, '-')
  
  const author = params.author
  const description = params.description

  await replaceInFile
    .sync({
      files: dist + '/**/*',
      from: [
        /Plugin Base Boilerplate/g,
        /PluginBaseBoilerplate/g,
        /plugin-base-boilerplate/g,
        /WordPress plugin base boilerplate/g,
        /Saulo Paiva/g,
      ],
      to: [
        projectDefault,
        projectCamelCase,
        projectDashCase,
        description,
        author,
      ],
    })

  console.log('Replace finished')
}

const deleteDist = async () => {
  rimraf.sync(dist)
}

const download = async () => {
  return new Promise((resolve, reject) => {
    ghdownload({user: 'saulopaiva', repo: 'plugin-base-boilerplate', ref: 'master'}, dist)
      .on('error', function(err) {
        console.error(err)
        reject()
      })
      .on('end', function() {
        console.log('Download finished')
        resolve()
      })
  })
}