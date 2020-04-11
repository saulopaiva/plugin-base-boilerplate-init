#!/usr/bin/env node
const fs = require('fs')
const prompt = require('prompt')
const rimraf = require("rimraf")
const ghdownload = require('github-download')
const replaceInFile = require('replace-in-file')
const uppercamelcase = require('uppercamelcase')

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

let projectProperties = {}

prompt.start()

prompt.get(properties, async function (err, result) {
  if (err) { return onErr(err) }
  console.log('Creating plugin')

  projectProperties = normalizeProperties(result)
  
  await deleteDist()
  await download()
  await replaceNames()
  await renameEntryPoint()

  console.log('Done!')
  console.log('Check dist folder')
})

const onErr = function(err) {
  console.log(err)
  return 1
}

const normalizeProperties = (params) => {
  const projectDefault = params.project
  const projectCamelCase = uppercamelcase(projectDefault)
  const projectDashCase = projectDefault.toLowerCase().replace(/\s/g, '-')
  
  const author = params.author
  const description = params.description

  return {
    projectName: projectDefault,
    projectCamelCase: projectCamelCase,
    projectDashCase: projectDashCase,
    author: author,
    description: description,
  }
}

const renameEntryPoint = async () => {
  return new Promise((resolve, reject) => {
    fs.rename(
      projectProperties.projectDashCase + '/plugin-base-boilerplate.php', 
      projectProperties.projectDashCase + '/' + projectProperties.projectDashCase + '.php',
      function (err) {
        if (err) {
          reject()
          throw err
        }

        console.log('Entry point renamed');
        resolve()
      }
    )
  })
}

const replaceNames = async () => {
  await replaceInFile
    .sync({
      files: projectProperties.projectDashCase + '/**/*',
      from: [
        /Plugin Base Boilerplate/g,
        /PluginBaseBoilerplate/g,
        /plugin-base-boilerplate/g,
        /WordPress plugin base boilerplate/g,
        /Saulo Paiva/g,
      ],
      to: [
        projectProperties.projectName,
        projectProperties.projectCamelCase,
        projectProperties.projectDashCase,
        projectProperties.description,
        projectProperties.author,
      ],
    })

  console.log('Replace finished')
}

const deleteDist = async () => {
  rimraf.sync(projectProperties.projectDashCase)
}

const download = async () => {
  return new Promise((resolve, reject) => {
    ghdownload({user: 'saulopaiva', repo: 'plugin-base-boilerplate', ref: 'master'}, projectProperties.projectDashCase)
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