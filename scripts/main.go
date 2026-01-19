package main

import (
	"compress/gzip"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"os"
	"strconv"
)

type MinifigJSON struct {
	FigNum string `json:"fig_num"`
	Name   string `json:"name"`
	ImgURL string `json:"img_url"`
	Year   string `json:"year"`
	Theme  string `json:"theme"`
}

type ThemeInfo struct {
	Name     string
	ParentID string
}

func main() {
	// 1. 各CSV.gzを読み込む
	themes := loadThemesGz("themes.csv.gz")
	sets := loadSetsGz("sets.csv.gz", themes)
	invToSet := loadInventoriesGz("inventories.csv.gz")
	figToInvs := loadInventoryMinifigsGz("inventory_minifigs.csv.gz")

	// 2. ミニフィグデータをマージ
	f, _ := os.Open("minifigs.csv.gz")
	defer f.Close()
	gz, _ := gzip.NewReader(f)
	r := csv.NewReader(gz)
	records, _ := r.ReadAll()

	var result []MinifigJSON

	for i, row := range records {
		if i == 0 {
			continue
		}
		figNum, name := row[0], row[1]

		releaseYear, themeName := "Unknown", "Unknown"
		minYear := 9999

		if invIds, ok := figToInvs[figNum]; ok {
			for _, invID := range invIds {
				if setNum, ok := invToSet[invID]; ok {
					if setData, ok := sets[setNum]; ok {
						y, _ := strconv.Atoi(setData.Year)
						if y < minYear {
							minYear = y
							releaseYear = setData.Year
							themeName = setData.Theme
						}
					}
				}
			}
		}

		result = append(result, MinifigJSON{
			FigNum: figNum,
			Name:   name,
			ImgURL: fmt.Sprintf("https://cdn.rebrickable.com/media/sets/%s.jpg", figNum),
			Year:   releaseYear,
			Theme:  themeName,
		})
	}

	out, _ := json.MarshalIndent(result, "", "  ")
	os.WriteFile("../public/data/minifigs.json", out, 0644)
	fmt.Println("Done: minifigs.json generated.")
}

// --- 補助関数：.gzを直接読み込んでMap化 ---

func getReader(path string) (*csv.Reader, *os.File) {
	f, _ := os.Open(path)
	gz, _ := gzip.NewReader(f)
	return csv.NewReader(gz), f
}

func loadThemesGz(path string) map[string]string {
	m := make(map[string]ThemeInfo)
	r, f := getReader(path)
	defer f.Close()

	records, _ := r.ReadAll()
	for i, row := range records {
		if i == 0 {
			continue
		}
		m[row[0]] = ThemeInfo{Name: row[1], ParentID: row[2]}
	}

	// 親テーマを遡って "Star Wars / Ultimate Collector Series" のような形式にする
	finalThemes := make(map[string]string)
	for id, info := range m {
		fullPath := info.Name
		current := info
		for current.ParentID != "" {
			parent, ok := m[current.ParentID]
			if !ok {
				break
			}
			fullPath = parent.Name + " > " + fullPath
			current = parent
		}
		finalThemes[id] = fullPath
	}
	return finalThemes
}

func loadSetsGz(path string, themes map[string]string) map[string]struct{ Year, Theme string } {
	m := make(map[string]struct{ Year, Theme string })
	r, f := getReader(path)
	defer f.Close()
	records, _ := r.ReadAll()
	for i, row := range records {
		if i == 0 {
			continue
		}
		m[row[0]] = struct{ Year, Theme string }{Year: row[2], Theme: themes[row[3]]}
	}
	return m
}

func loadInventoriesGz(path string) map[string]string {
	m := make(map[string]string)
	r, f := getReader(path)
	defer f.Close()
	records, _ := r.ReadAll()
	for i, row := range records {
		if i == 0 {
			continue
		}
		m[row[0]] = row[2]
	}
	return m
}

func loadInventoryMinifigsGz(path string) map[string][]string {
	m := make(map[string][]string)
	r, f := getReader(path)
	defer f.Close()
	records, _ := r.ReadAll()
	for i, row := range records {
		if i == 0 {
			continue
		}
		m[row[1]] = append(m[row[1]], row[0])
	}
	return m
}
