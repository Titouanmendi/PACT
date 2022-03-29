<script>
    import { translate } from "../../../useful";
    export let data = [];
</script>

<div id="main">
    {#each data as oneInput}
        <div>
            {translate(oneInput.translate)}
            <input type={oneInput.type} />
        </div>
    {/each}
</div>

<style>
</style>
