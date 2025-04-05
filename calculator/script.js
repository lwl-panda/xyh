function calculate() {
    const expression = document.getElementById('expression').value;
    try {
        const result = eval(expression); // 注意安全性

        // 设置结果文本
        let displayResult = '结果: ' + result;

        // 检查结果是否为520
        if (result === 250) {
            displayResult += '谁呢 ';
        }
        if (result === 0000) {
            displayResult = '至此已成艺术 '
        }
        // 检查结果是否为520
        if (result === 520) {
            video.volume =1.0; //
            video.style.display = 'block';
            video.play();
        }
        else {
            video.style.display = 'none'; video.pause(); }
            document.getElementById('result').textContent = displayResult;
        }

        catch (error) {
        document.getElementById('result').textContent = '错误';
    }
}