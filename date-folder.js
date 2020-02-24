#!/usr/bin/env osascript -l JavaScript

function run(input, parameters) {
  const finder = Application('Finder');
  const currentApp = Application.currentApplication();
	currentApp.includeStandardAdditions = true;
	
  let currentTarget = '';
  const finderWindows = finder.finderWindows();
  if(finderWindows.length){
    currentTarget = finder.finderWindows[0].target().url();
  }
  // default to Desktop if no Finder window or path unusable
  currentTarget = currentTarget || currentApp.doShellScript(`osascript -e 'tell app "finder" to get posix path of (get desktop as alias)'`);
  // currentApp.displayAlert('There are no Finder windows open.', {
  //   message: 'First open a Finder window where you want the new folder created.',
  //   as: 'critical',
  //   buttons: ['Duh!']
  // });
  // return -1;
  debugger
	const [year, month, day] = (new Date()).toISOString().split('T')[0].split('-');
	
	const today = `${year}-${month}-${day}`;
	const todayPlus1 = `${year}-${month}-${addAndPad(day, 1)}`;
	const todayPlus2 = `${year}-${month}-${addAndPad(day, 2)}`;
	const todayMinus1 = `${year}-${month}-${addAndPad(day, -1)}`;
	const todayMinus2 = `${year}-${month}-${addAndPad(day, -2)}`;
	const dialogText = `Pick the name for the new folder:
	
\tYesterday:\t${todayMinus1}
\tToday:\t\t${today}
\tTomorrow:\t${todayPlus1}`;

  const answer = currentApp.displayDialog(dialogText, {
    buttons: ['Yesterday', 'Today', 'Tomorrow'],
    defaultButton: 'Today',
    withIcon: 'note',
    givingUpAfter: 10
  });
  const answerMap = {
    'Yesterday': todayMinus1,
    'Today': today,
    'Tomorrow': todayPlus1
  };
  // console.log(JSON.stringify(answer));
  if(!answer.gaveUp){
    let path = $.NSURL.alloc.initWithString(`${currentTarget}${answerMap[answer.buttonReturned]}`).fileSystemRepresentation;
    // console.log('exists: ', folderExists(path));
    if(!folderExists(path)) {
      const ret = currentApp.doShellScript(`mkdir -pv "${path}"`);
      return path;
    } else {
      currentApp.displayAlert('Folder already exists.', {
        message: path,
        as: 'critical',
        buttons: ['Bummer']
      });
    }
  }
}

function addAndPad(num, op){
  return (parseInt(num, 10) + op).toString().padStart(2, '0');
}

function folderExists(path){
  const currentApp = Application.currentApplication();
	currentApp.includeStandardAdditions = true;
  return !currentApp.doShellScript(`file "${path}"`).toLowerCase().includes('no such file or directory');
}