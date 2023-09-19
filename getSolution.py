from sys import argv
from json import load
from pprint import pprint

NUM = argv[1]

def readJson():
    with open('temp.json', 'r') as sud:
        return load(sud)

def getSoln():
    sudoku = readJson()
    value = sudoku["sudoku-{}".format(NUM)]['newboard']['grids'][0]['value']
    soln = sudoku["sudoku-{}".format(NUM)]['newboard']['grids'][0]['solution']
    return {"value": value, "soln": soln}

def main():
    pprint(getSoln())

if __name__ == "__main__":
    main()
